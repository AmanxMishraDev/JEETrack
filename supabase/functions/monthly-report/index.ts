

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "reports@jeetrack.app";
const APP_URL = Deno.env.get("APP_URL") || "https://jeetrack.app";

const INACTIVE_DAYS = 20;

serve(async (req) => {
  
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.includes("Bearer")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const monthStartStr = monthStart.toISOString().split("T")[0];
  const monthEndStr = monthEnd.toISOString().split("T")[0];
  const monthName = monthStart.toLocaleString("en-IN", { month: "long", year: "numeric" });

  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - INACTIVE_DAYS);

  const { data: activeUsers, error: prefErr } = await supabase
    .from("user_preferences")
    .select("user_id, last_active_at, report_last_sent_at")
    .eq("email_reports", "monthly")
    .gte("last_active_at", cutoffDate.toISOString());

  if (prefErr) {
    console.error("Error fetching prefs:", prefErr);
    return new Response(JSON.stringify({ error: prefErr.message }), { status: 500 });
  }

  if (!activeUsers?.length) {
    return new Response(JSON.stringify({ message: "No active users to email" }), { status: 200 });
  }

  let sent = 0, skipped = 0, failed = 0;

  for (const pref of activeUsers) {
    
    if (pref.report_last_sent_at) {
      const lastSent = new Date(pref.report_last_sent_at);
      if (lastSent.getMonth() === now.getMonth() - 1 && lastSent.getFullYear() === now.getFullYear()) {
        skipped++;
        continue;
      }
    }

    const userId = pref.user_id;

    try {
      
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      const email = userData?.user?.email;
      const name = userData?.user?.user_metadata?.full_name ||
                   email?.split("@")[0] || "JEE Aspirant";

      if (!email) { skipped++; continue; }

      
      const [testsRes, hoursRes, backlogsRes, sylRes] = await Promise.all([
        supabase.from("tests").select("*").eq("user_id", userId)
          .gte("date", monthStartStr).lte("date", monthEndStr),
        supabase.from("hours").select("*").eq("user_id", userId)
          .gte("date", monthStartStr).lte("date", monthEndStr),
        supabase.from("backlogs").select("*").eq("user_id", userId),
        supabase.from("syllabus").select("*").eq("user_id", userId),
      ]);

      const tests = testsRes.data || [];
      const hours = hoursRes.data || [];
      const backlogs = backlogsRes.data || [];
      const syllabus = sylRes.data || [];

      
      const stats = calculateStats(tests, hours, backlogs, syllabus, monthStartStr, monthEndStr);

      
      const pdfBase64 = generateReportPDF(name, monthName, stats, tests, hours);

      
      const emailHtml = generateEmailHTML(name, monthName, stats, APP_URL);

      
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `JEETrack Reports <${FROM_EMAIL}>`,
          to: [email],
          subject: `Your JEETrack Monthly Report — ${monthName}`,
          html: emailHtml,
          attachments: pdfBase64 ? [{
            filename: `JEETrack-Report-${monthName.replace(" ", "-")}.pdf`,
            content: pdfBase64,
          }] : undefined,
        }),
      });

      if (res.ok) {
        
        await supabase.from("user_preferences")
          .update({ report_last_sent_at: now.toISOString(), updated_at: now.toISOString() })
          .eq("user_id", userId);
        sent++;
      } else {
        const err = await res.text();
        console.error(`Failed for ${email}:`, err);
        failed++;
      }
    } catch (e) {
      console.error(`Error for user ${userId}:`, e);
      failed++;
    }
  }

  return new Response(
    JSON.stringify({ message: "Done", sent, skipped, failed }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});

function calculateStats(tests: any[], hours: any[], backlogs: any[], syllabus: any[], monthStart: string, monthEnd: string) {
  
  const mainsTests = tests.filter(t => t.exam === "mains");
  const advTests = tests.filter(t => t.exam === "advanced");
  const allScores = tests.map(t => t.max ? (t.total / t.max) * 100 : 0);
  const bestScore = allScores.length ? Math.max(...allScores) : 0;
  const avgScore = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;

  
  const totalHours = hours.reduce((a: number, b: any) => a + (b.total || 0), 0);
  const lectureHours = hours.reduce((a: number, b: any) => a + (b.lecture || 0), 0);
  const practiceHours = hours.reduce((a: number, b: any) => a + (b.practice || 0), 0);
  const revisionHours = hours.reduce((a: number, b: any) => a + (b.revision || 0), 0);
  const studyDays = new Set(hours.map((h: any) => h.date)).size;
  const avgHoursPerDay = studyDays ? (totalHours / studyDays).toFixed(1) : "0";

  
  const dayMap: { [key: string]: number } = {};
  hours.forEach((h: any) => { dayMap[h.date] = (dayMap[h.date] || 0) + (h.total || 0); });
  const bestDayTotal = Object.values(dayMap).length ? Math.max(...Object.values(dayMap)) : 0;

  
  const subjectProgress: { [key: string]: { done: number; total: number } } = {
    physics: { done: 0, total: 0 },
    chemistry: { done: 0, total: 0 },
    maths: { done: 0, total: 0 },
  };
  syllabus.forEach((ch: any) => {
    const s = ch.subject;
    if (subjectProgress[s]) {
      subjectProgress[s].total++;
      if (ch.theory && ch.practice) subjectProgress[s].done++;
    }
  });

  
  const pendingBacklogs = backlogs.filter((b: any) => !b.done).length;
  const clearedBacklogs = backlogs.filter((b: any) => b.done).length;

  return {
    tests: { total: tests.length, mains: mainsTests.length, adv: advTests.length, bestScore: bestScore.toFixed(1), avgScore: avgScore.toFixed(1) },
    hours: { total: totalHours.toFixed(1), lecture: lectureHours.toFixed(1), practice: practiceHours.toFixed(1), revision: revisionHours.toFixed(1), studyDays, avgPerDay: avgHoursPerDay, bestDay: bestDayTotal.toFixed(1) },
    syllabus: subjectProgress,
    backlogs: { pending: pendingBacklogs, cleared: clearedBacklogs },
  };
}

function generateReportPDF(name: string, month: string, stats: any, tests: any[], hours: any[]): string {
  
  const lines: string[] = [];

  const addLine = (text: string) => lines.push(text);

  
  const content = [
    `JEETrack Monthly Report`,
    `${month}`,
    ``,
    `Student: ${name}`,
    `Generated: ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `📊 TEST PERFORMANCE`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Tests Taken:     ${stats.tests.total}`,
    `JEE Mains:       ${stats.tests.mains}`,
    `JEE Advanced:    ${stats.tests.adv}`,
    `Best Score:      ${stats.tests.bestScore}%`,
    `Average Score:   ${stats.tests.avgScore}%`,
    ``,
    `⏱  STUDY HOURS`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Total Hours:     ${stats.hours.total}h`,
    `Active Days:     ${stats.hours.studyDays}`,
    `Avg Per Day:     ${stats.hours.avgPerDay}h`,
    `Best Day:        ${stats.hours.bestDay}h`,
    `Lecture:         ${stats.hours.lecture}h`,
    `Practice:        ${stats.hours.practice}h`,
    `Revision:        ${stats.hours.revision}h`,
    ``,
    `📚 SYLLABUS PROGRESS`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Physics:         ${stats.syllabus.physics.done}/${stats.syllabus.physics.total} chapters (${stats.syllabus.physics.total ? Math.round(stats.syllabus.physics.done / stats.syllabus.physics.total * 100) : 0}%)`,
    `Chemistry:       ${stats.syllabus.chemistry.done}/${stats.syllabus.chemistry.total} chapters (${stats.syllabus.chemistry.total ? Math.round(stats.syllabus.chemistry.done / stats.syllabus.chemistry.total * 100) : 0}%)`,
    `Maths:           ${stats.syllabus.maths.done}/${stats.syllabus.maths.total} chapters (${stats.syllabus.maths.total ? Math.round(stats.syllabus.maths.done / stats.syllabus.maths.total * 100) : 0}%)`,
    ``,
    `📌 BACKLOGS`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Pending:         ${stats.backlogs.pending}`,
    `Cleared:         ${stats.backlogs.cleared}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `JEETrack — Your JEE preparation companion`,
    `Crafted by Aman Mishra`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  ];

  
  if (tests.length > 0) {
    content.push(``, `🎯 TEST HISTORY THIS MONTH`, `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    tests.slice(0, 10).forEach((t: any) => {
      const pct = t.max ? ((t.total / t.max) * 100).toFixed(1) : "—";
      content.push(`${t.date}  ${t.exam === "mains" ? "Mains" : "Adv  "}  ${t.total}/${t.max}  (${pct}%)`);
    });
  }

  
  const textContent = content.join("\n");

  
  const pdfLines: string[] = [];
  const streamContent = content.map((line, i) => `BT /F1 11 Tf 50 ${750 - i * 16} Td (${line.replace(/[()\\]/g, "\\$&")}) Tj ET`).join("\n");

  const stream = streamContent;
  const streamLen = new TextEncoder().encode(stream).length;

  const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Courier>>>>>>>>>/Contents 4 0 R>>endobj
4 0 obj<</Length ${streamLen}>>
stream
${stream}
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
trailer<</Size 5/Root 1 0 R>>
startxref
${350 + streamLen}
%%EOF`;

  
  const encoder = new TextEncoder();
  const bytes = encoder.encode(pdf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function generateEmailHTML(name: string, month: string, stats: any, appUrl: string): string {
  const phyPct = stats.syllabus.physics.total ? Math.round(stats.syllabus.physics.done / stats.syllabus.physics.total * 100) : 0;
  const chePct = stats.syllabus.chemistry.total ? Math.round(stats.syllabus.chemistry.done / stats.syllabus.chemistry.total * 100) : 0;
  const matPct = stats.syllabus.maths.total ? Math.round(stats.syllabus.maths.done / stats.syllabus.maths.total * 100) : 0;

  const progressBar = (pct: number, color: string) =>
    `<div style="background:#1e1e28;border-radius:99px;height:8px;margin:4px 0 12px"><div style="width:${pct}%;background:${color};height:100%;border-radius:99px"></div></div>`;

  const motivate = () => {
    const hrs = parseFloat(stats.hours.total);
    const tests = stats.tests.total;
    if (hrs > 80 && tests > 4) return "🔥 Exceptional month! You're on track for a top rank.";
    if (hrs > 50) return "💪 Strong effort this month. Keep building the habit.";
    if (hrs > 20) return "📈 Good progress. Push a little harder next month.";
    if (tests > 0) return "✅ You showed up. That matters. More hours next month.";
    return "⚡ A new month is a fresh start. Let's make it count.";
  };

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;color:#f0eff5">
<div style="max-width:580px;margin:0 auto;padding:24px 16px">

  <!-- Header -->
  <div style="text-align:center;padding:32px 0 24px">
    <div style="font-size:28px;font-weight:900;letter-spacing:-0.5px">
      JEE<span style="background:linear-gradient(135deg,#a695ff,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Track</span>
    </div>
    <div style="color:#7a7990;font-size:13px;margin-top:6px">Monthly Performance Report</div>
    <div style="color:#a695ff;font-size:15px;font-weight:600;margin-top:4px">${month}</div>
  </div>

  <!-- Greeting -->
  <div style="background:#111118;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px 24px;margin-bottom:16px">
    <p style="margin:0 0 8px;font-size:16px;font-weight:600">Hi ${name} 👋</p>
    <p style="margin:0;color:#7a7990;font-size:14px;line-height:1.6">
      Here's your complete JEE preparation summary for <strong style="color:#f0eff5">${month}</strong>. 
      Your PDF report card is attached to this email.
    </p>
  </div>

  <!-- Motivation banner -->
  <div style="background:linear-gradient(135deg,rgba(124,106,247,0.12),rgba(244,114,182,0.08));border:1px solid rgba(124,106,247,0.2);border-radius:12px;padding:14px 20px;margin-bottom:16px;font-size:14px;color:#a695ff">
    ${motivate()}
  </div>

  <!-- Stats Grid -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">

    <!-- Tests -->
    <div style="background:#111118;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px">
      <div style="font-size:10px;font-weight:600;color:#7a7990;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Tests Taken</div>
      <div style="font-size:32px;font-weight:800;color:#a695ff;line-height:1">${stats.tests.total}</div>
      <div style="font-size:12px;color:#7a7990;margin-top:4px">Mains: ${stats.tests.mains} · Adv: ${stats.tests.adv}</div>
    </div>

    <!-- Study Hours -->
    <div style="background:#111118;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px">
      <div style="font-size:10px;font-weight:600;color:#7a7990;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Study Hours</div>
      <div style="font-size:32px;font-weight:800;color:#34d399;line-height:1">${stats.hours.total}h</div>
      <div style="font-size:12px;color:#7a7990;margin-top:4px">${stats.hours.studyDays} active days · ${stats.hours.avgPerDay}h/day avg</div>
    </div>

    <!-- Best Score -->
    <div style="background:#111118;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px">
      <div style="font-size:10px;font-weight:600;color:#7a7990;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Best Score</div>
      <div style="font-size:32px;font-weight:800;color:#fbbf24;line-height:1">${stats.tests.bestScore}%</div>
      <div style="font-size:12px;color:#7a7990;margin-top:4px">Avg: ${stats.tests.avgScore}%</div>
    </div>

    <!-- Backlogs -->
    <div style="background:#111118;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px">
      <div style="font-size:10px;font-weight:600;color:#7a7990;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Backlogs</div>
      <div style="font-size:32px;font-weight:800;color:${stats.backlogs.pending > 0 ? "#f87171" : "#34d399"};line-height:1">${stats.backlogs.pending}</div>
      <div style="font-size:12px;color:#7a7990;margin-top:4px">pending · ${stats.backlogs.cleared} cleared</div>
    </div>
  </div>

  <!-- Hours Breakdown -->
  <div style="background:#111118;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px 20px;margin-bottom:16px">
    <div style="font-size:11px;font-weight:600;color:#7a7990;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:14px">Hours Breakdown</div>
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px"><span style="color:#60a5fa">Lecture</span><span style="font-family:monospace">${stats.hours.lecture}h</span></div>
    ${progressBar(stats.hours.total > 0 ? parseFloat(stats.hours.lecture) / parseFloat(stats.hours.total) * 100 : 0, "#60a5fa")}
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px"><span style="color:#34d399">Practice</span><span style="font-family:monospace">${stats.hours.practice}h</span></div>
    ${progressBar(stats.hours.total > 0 ? parseFloat(stats.hours.practice) / parseFloat(stats.hours.total) * 100 : 0, "#34d399")}
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px"><span style="color:#a695ff">Revision</span><span style="font-family:monospace">${stats.hours.revision}h</span></div>
    ${progressBar(stats.hours.total > 0 ? parseFloat(stats.hours.revision) / parseFloat(stats.hours.total) * 100 : 0, "#a695ff")}
  </div>

  <!-- Syllabus Progress -->
  <div style="background:#111118;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px 20px;margin-bottom:16px">
    <div style="font-size:11px;font-weight:600;color:#7a7990;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:14px">Syllabus Progress</div>
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px"><span style="color:#60a5fa">Physics</span><span style="font-family:monospace">${stats.syllabus.physics.done}/${stats.syllabus.physics.total} · ${phyPct}%</span></div>
    ${progressBar(phyPct, "#60a5fa")}
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px"><span style="color:#34d399">Chemistry</span><span style="font-family:monospace">${stats.syllabus.chemistry.done}/${stats.syllabus.chemistry.total} · ${chePct}%</span></div>
    ${progressBar(chePct, "#34d399")}
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px"><span style="color:#fbbf24">Maths</span><span style="font-family:monospace">${stats.syllabus.maths.done}/${stats.syllabus.maths.total} · ${matPct}%</span></div>
    ${progressBar(matPct, "#fbbf24")}
  </div>

  <!-- CTA -->
  <div style="text-align:center;margin:24px 0">
    <a href="${appUrl}" style="background:linear-gradient(135deg,#7c6af7,#f472b6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;display:inline-block">
      Open JEETrack →
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:24px 0;border-top:1px solid rgba(255,255,255,0.06)">
    <div style="font-size:12px;color:#4a4960;line-height:1.8">
      JEETrack · Your JEE preparation companion<br>
      Built for aspirants who take their prep seriously<br><br>
      <a href="${appUrl}/unsubscribe?uid=USER_ID_PLACEHOLDER" style="color:#4a4960">Unsubscribe from monthly reports</a>
    </div>
  </div>

</div>
</body>
</html>`;
}
