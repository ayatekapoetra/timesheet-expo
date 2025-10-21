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

// Test 1: User pilih tanggal ops
const userInput1 = "2025-10-14";
const selected1 = hariOptions2.find(option => 
  option.label.toLowerCase().includes(userInput1.toLowerCase()) || 
  option.value === userInput1
);

if (selected1) {
  console.log(`✅ Input "${userInput1}" dikenali sebagai: ${selected1.displayDate}`);
  console.log(`📅 Tanggal tersimpan: ${selected1.value}`);
  
  // Simulasi input waktu
  const waktuInput = "19:00";
  const datetime = `${selected1.value} ${waktuInput}`;
  console.log(`🕐 Waktu mulai tersimpan: ${datetime}`);
  
  // Simulasi next day scenario
  const waktuSelesai = "01:00";
  const startTime = new Date(datetime);
  let endTime = new Date(`${selected1.value} ${waktuSelesai}`);
  
  console.log(`Debug: startTime = ${startTime}`);
  console.log(`Debug: endTime = ${endTime}`);
  console.log(`Debug: endTime <= startTime = ${endTime <= startTime}`);
  
  if (endTime <= startTime) {
    endTime.setDate(endTime.getDate() + 1);
    // Format manually to avoid timezone issues
    const year = endTime.getFullYear();
    const month = String(endTime.getMonth() + 1).padStart(2, '0');
    const day = String(endTime.getDate()).padStart(2, '0');
    const hours = String(endTime.getHours()).padStart(2, '0');
    const minutes = String(endTime.getMinutes()).padStart(2, '0');
    const formattedEndTime = `${year}-${month}-${day} ${hours}:${minutes}`;
    
    console.log(`Debug: adjusted endTime = ${endTime}`);
    console.log(`Debug: formattedEndTime = ${formattedEndTime}`);
    console.log(`⏰ Next day detected!`);
    console.log(`🕐 Waktu selesai tersimpan: ${formattedEndTime}`);
    console.log(`📅 Expected: 2025-10-15 01:00 (besok dari 14/10/2025)`);
  } else {
    console.log(`🕐 Waktu selesai tersimpan: ${selected1.value} ${waktuSelesai}`);
  }
} else {
  console.log(`❌ Input "${userInput1}" tidak dikenali`);
}

// Test 2: User pilih "Besok" (15/10/2025)
const userInput2 = "Besok";
const selected2 = hariOptions2.find(option => 
  option.label.toLowerCase().includes(userInput2.toLowerCase()) || 
  option.value === userInput2
);

if (selected2) {
  console.log(`\n✅ Input "${userInput2}" dikenali sebagai: ${selected2.displayDate}`);
  console.log(`📅 Tanggal tersimpan: ${selected2.value}`);
  console.log(`📅 Expected: 2025-10-15 (besok dari 14/10/2025)`);
} else {
  console.log(`\n❌ Input "${userInput2}" tidak dikenali`);
}

console.log('\n=== TEST COMPLETED ===');