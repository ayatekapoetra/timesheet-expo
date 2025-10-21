// Test script untuk validasi pemilihan hari di AI Chat Timesheet
const moment = require('moment');

// Mock fungsi yang sama dengan di ai-chat.jsx
const formatHari = (date) => {
  return moment(date).locale('id').format('dddd');
};

const formatBulan = (date) => {
  return moment(date).locale('id').format('MMM');
};

const generateHariOptions = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const hariIni = {
    label: `Hari Ini (${formatHari(today)}, ${today.getDate()} ${formatBulan(today)} ${today.getFullYear()})`,
    value: today.toISOString().slice(0, 10), // YYYY-MM-DD
    displayDate: formatHari(today) + ', ' + today.getDate() + ' ' + formatBulan(today) + ' ' + today.getFullYear()
  };
  
  const besok = {
    label: `Besok (${formatHari(tomorrow)}, ${tomorrow.getDate()} ${formatBulan(tomorrow)} ${tomorrow.getFullYear()})`,
    value: tomorrow.toISOString().slice(0, 10), // YYYY-MM-DD
    displayDate: formatHari(tomorrow) + ', ' + tomorrow.getDate() + ' ' + formatBulan(tomorrow) + ' ' + tomorrow.getFullYear()
  };
  
  return [hariIni, besok];
};

// Test scenario
console.log('=== TEST PEMILIHAN HARI ===');

const hariOptions = generateHariOptions();
console.log('\nOpsi Hari yang tersedia:');
hariOptions.forEach((option, index) => {
  console.log(`${index + 1}. ${option.label}`);
  console.log(`   Value: ${option.value}`);
  console.log(`   Display: ${option.displayDate}`);
});

// Test user input simulation
console.log('\n=== SIMULASI USER INPUT ===');

// Test 1: User pilih "Hari Ini"
const userInput1 = "Hari Ini";
const selected1 = hariOptions.find(option => 
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
  } else {
    console.log(`🕐 Waktu selesai tersimpan: ${selected1.value} ${waktuSelesai}`);
  }
} else {
  console.log(`❌ Input "${userInput1}" tidak dikenali`);
}

// Test 2: User pilih "Besok"
const userInput2 = "Besok";
const selected2 = hariOptions.find(option => 
  option.label.toLowerCase().includes(userInput2.toLowerCase()) || 
  option.value === userInput2
);

if (selected2) {
  console.log(`\n✅ Input "${userInput2}" dikenali sebagai: ${selected2.displayDate}`);
  console.log(`📅 Tanggal tersimpan: ${selected2.value}`);
} else {
  console.log(`\n❌ Input "${userInput2}" tidak dikenali`);
}

console.log('\n=== TEST COMPLETED ===');