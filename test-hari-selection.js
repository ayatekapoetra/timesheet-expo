// Test script untuk validasi pemilihan hari di AI Chat Timesheet
const moment = require('moment');

// Mock fungsi yang sama dengan di ai-chat.jsx
const formatHari = (date) => {
  return moment(date).locale('id').format('dddd');
};

const formatBulan = (date) => {
  return moment(date).locale('id').format('MMM');
};

const generateHariOptions = (tanggalOps = null) => {
  // Gunakan tanggal operational yang dipilih di awal
  const dateOps = tanggalOps ? new Date(tanggalOps) : new Date();
  const tomorrow = new Date(dateOps);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const hariOps = {
    label: `${formatHari(dateOps)}, ${dateOps.getDate()} ${formatBulan(dateOps)} ${dateOps.getFullYear()} (Tanggal Ops)`,
    value: dateOps.toISOString().slice(0, 10), // YYYY-MM-DD
    displayDate: formatHari(dateOps) + ', ' + dateOps.getDate() + ' ' + formatBulan(dateOps) + ' ' + dateOps.getFullYear()
  };
  
  const besok = {
    label: `Besok (${formatHari(tomorrow)}, ${tomorrow.getDate()} ${formatBulan(tomorrow)} ${tomorrow.getFullYear()})`,
    value: tomorrow.toISOString().slice(0, 10), // YYYY-MM-DD
    displayDate: formatHari(tomorrow) + ', ' + tomorrow.getDate() + ' ' + formatBulan(tomorrow) + ' ' + tomorrow.getFullYear()
  };
  
  return [hariOps, besok];
};

// Test scenario
console.log('=== TEST PEMILIHAN HARI ===');

// Test 1: Default (hari ini)
console.log('\n--- Scenario 1: Tanggal Ops Hari Ini ---');
const hariOptions1 = generateHariOptions();
console.log('Opsi Hari yang tersedia:');
hariOptions1.forEach((option, index) => {
  console.log(`${index + 1}. ${option.label}`);
  console.log(`   Value: ${option.value}`);
  console.log(`   Display: ${option.displayDate}`);
});

// Test 2: Tanggal Ops spesifik (14/10/2025)
console.log('\n--- Scenario 2: Tanggal Ops 14/10/2025 ---');
const tanggalOps = '2025-10-14';
const hariOptions2 = generateHariOptions(tanggalOps);
console.log('Opsi Hari yang tersedia:');
hariOptions2.forEach((option, index) => {
  console.log(`${index + 1}. ${option.label}`);
  console.log(`   Value: ${option.value}`);
  console.log(`   Display: ${option.displayDate}`);
});

// Test user input simulation
console.log('\n=== SIMULASI USER INPUT ===');

// Test dengan tanggal ops 14/10/2025
console.log('\n=== SIMULASI USER INPUT (Tanggal Ops: 14/10/2025) ===');

// Test 1: User pilih tanggal ops (14/10/2025)
const userInput1 = "2025-10-14";
const selected1 = hariOptions2.find(option => 
  option.label.toLowerCase().includes(userInput1.toLowerCase()) || 
  option.value === userInput1
);

if (selected1) {
  console.log(`✅ Input "${userInput1}" dikenali sebagai: ${selected1.displayDate}`);
  console.log(`📅 Tanggal kegiatan tersimpan: ${selected1.value}`);
  
  // Simulasi input waktu mulai
  const waktuMulai = "19:00";
  const starttime = `${selected1.value} ${waktuMulai}`;
  console.log(`🕐 Waktu mulai tersimpan: ${starttime}`);
  
  // Simulasi input waktu selesai dengan next day scenario
  const waktuSelesai = "01:00";
  const startTime = new Date(starttime);
  let endTime = new Date(`${selected1.value} ${waktuSelesai}`);
  
  console.log(`Debug: startTime = ${startTime}`);
  console.log(`Debug: initial endTime = ${endTime}`);
  console.log(`Debug: endTime <= startTime = ${endTime <= startTime}`);
  
  let isNextDay = false;
  if (endTime <= startTime) {
    endTime.setDate(endTime.getDate() + 1);
    isNextDay = true;
  }
  
  // Format manually to avoid timezone issues
  const year = endTime.getFullYear();
  const month = String(endTime.getMonth() + 1).padStart(2, '0');
  const day = String(endTime.getDate()).padStart(2, '0');
  const hours = String(endTime.getHours()).padStart(2, '0');
  const minutes = String(endTime.getMinutes()).padStart(2, '0');
  const formattedEndTime = `${year}-${month}-${day} ${hours}:${minutes}`;
  
  console.log(`Debug: adjusted endTime = ${endTime}`);
  console.log(`Debug: formattedEndTime = ${formattedEndTime}`);
  
  if (isNextDay) {
    console.log(`⏰ Next day detected!`);
    console.log(`🕐 Waktu selesai tersimpan: ${formattedEndTime}`);
    console.log(`📅 Expected: 2025-10-15 01:00 (besok dari 14/10/2025)`);
  } else {
    console.log(`🕐 Waktu selesai tersimpan: ${formattedEndTime}`);
  }
  
  // Test 2: Same day scenario
  console.log(`\n--- Same Day Test ---`);
  const waktuSelesaiSameDay = "22:00";
  let endTimeSameDay = new Date(`${selected1.value} ${waktuSelesaiSameDay}`);
  
  if (endTimeSameDay <= startTime) {
    endTimeSameDay.setDate(endTimeSameDay.getDate() + 1);
  }
  
  const year2 = endTimeSameDay.getFullYear();
  const month2 = String(endTimeSameDay.getMonth() + 1).padStart(2, '0');
  const day2 = String(endTimeSameDay.getDate()).padStart(2, '0');
  const hours2 = String(endTimeSameDay.getHours()).padStart(2, '0');
  const minutes2 = String(endTimeSameDay.getMinutes()).padStart(2, '0');
  const formattedEndTimeSameDay = `${year2}-${month2}-${day2} ${hours2}:${minutes2}`;
  
  console.log(`🕐 Waktu selesai same day (22:00) tersimpan: ${formattedEndTimeSameDay}`);
  console.log(`📅 Expected: 2025-10-14 22:00 (same day)`);
  
} else {
  console.log(`❌ Input "${userInput1}" tidak dikenali`);
}

// Test 3: User pilih "Besok" (15/10/2025)
const userInput2 = "Besok";
const selected2 = hariOptions2.find(option => 
  option.label.toLowerCase().includes(userInput2.toLowerCase()) || 
  option.value === userInput2
);

if (selected2) {
  console.log(`\n✅ Input "${userInput2}" dikenali sebagai: ${selected2.displayDate}`);
  console.log(`📅 Tanggal kegiatan tersimpan: ${selected2.value}`);
  console.log(`📅 Expected: 2025-10-15 (besok dari 14/10/2025)`);
  
  // Test activity yang tidak melewati tengah malam
  const waktuMulai2 = "09:00";
  const waktuSelesai2 = "17:00";
  const starttime2 = `${selected2.value} ${waktuMulai2}`;
  const endTime2 = new Date(`${selected2.value} ${waktuSelesai2}`);
  
  const year3 = endTime2.getFullYear();
  const month3 = String(endTime2.getMonth() + 1).padStart(2, '0');
  const day3 = String(endTime2.getDate()).padStart(2, '0');
  const hours3 = String(endTime2.getHours()).padStart(2, '0');
  const minutes3 = String(endTime2.getMinutes()).padStart(2, '0');
  const formattedEndTime2 = `${year3}-${month3}-${day3} ${hours3}:${minutes3}`;
  
  console.log(`🕐 Waktu mulai tersimpan: ${starttime2}`);
  console.log(`🕐 Waktu selesai tersimpan: ${formattedEndTime2}`);
  console.log(`📅 Expected: 2025-10-15 17:00 (same day, no next day)`);
  
} else {
  console.log(`\n❌ Input "${userInput2}" tidak dikenali`);
}

console.log('\n=== TEST COMPLETED ===');