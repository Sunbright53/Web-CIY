// src/config.ts
export const CONFIG = {
  // ✅ ใช้ Apps Script เป็นแหล่ง "อ่าน" หลัก (students/reports)
  appScriptGetUrl:  "https://script.google.com/macros/s/AKfycbwGR9XMRHOW1YHjFtHbcgIVIT3PVWHlCBlZ05DYDJ5lFdiIZ9e1uAfRFCHqJXFYqUSO/exec",
  appScriptPostUrl: "https://script.google.com/macros/s/AKfycbwGR9XMRHOW1YHjFtHbcgIVIT3PVWHlCBlZ05DYDJ5lFdiIZ9e1uAfRFCHqJXFYqUSO/exec",

  // 🧰 (ยังเก็บ CSV เดิมไว้ใช้กับ Coaches หรือ fallback ถ้าจำเป็น)
  studentsCsv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT513ZZLUQp5zSHfkcfblFC5G0XrLUUJN6PBdfikUYr938X89Z_04AoN-yOXgczhd5kEdRzmDFjcB5E/pub?gid=0&single=true&output=csv",
  reportsCsv:  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT513ZZLUQp5zSHfkcfblFC5G0XrLUUJN6PBdfikUYr938X89Z_04AoN-yOXgczhd5kEdRzmDFjcB5E/pub?gid=1733230311&single=true&output=csv",
  coachesCsv:  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT513ZZLUQp5zSHfkcfblFC5G0XrLUUJN6PBdfikUYr938X89Z_04AoN-yOXgczhd5kEdRzmDFjcB5E/pub?gid=44605142&single=true&output=csv",

  sheetLinks: {
    students: "https://docs.google.com/spreadsheets/d/1TmQPVH-oM2B6PEam42h-bC0y5mc_Kgxry1EzwTZxkuE/edit?gid=0#gid=0",
    reports:  "https://docs.google.com/spreadsheets/d/1TmQPVH-oM2B6PEam42h-bC0y5mc_Kgxry1EzwTZxkuE/edit?gid=1733230311#gid=1733230311",
  },

  courseLinks: { rookie: '#', trainee: '#', special: '#' },

  programOptions: [
    "Python",
    "JavaScript",
    "Electronic Arduino (Blockly)",
    "Robotics Arduino (Blockly)",
    "Minecraft Edu (Blockly)",
    "HTML/CSS/JavaScript",
    "App (App Lab Blockly)",
    "3D Printing (Tinkercad)",
    "Scratch (coding)",
    "Scratch (Game creation)"
  ]
};
