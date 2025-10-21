// Test script untuk next day validation di AI Chat Timesheet
// Simulasi scenario: starttime 19:00, endtime 01:00 (next day)

const testNextDayValidation = () => {
  console.log('=== TEST NEXT DAY VALIDATION ===');
  
  // Scenario 1: Same day (normal)
  const tanggal = '2025-10-21';
  const starttime = '2025-10-21 19:00';
  const endtimeInput = '23:00';
  
  const datetime = `${tanggal} ${endtimeInput}`;
  const startTime = new Date(starttime);
  let endTime = new Date(datetime);
  
  console.log('\n--- Scenario 1: Same Day ---');
  console.log('Start Time:', startTime);
  console.log('End Time Input:', datetime);
  console.log('End Time Object:', endTime);
  console.log('End Time <= Start Time:', endTime <= startTime);
  
  if (endTime <= startTime) {
    endTime.setDate(endTime.getDate() + 1);
    console.log('Next day detected!');
    console.log('Adjusted End Time:', endTime);
  } else {
    console.log('Same day - no adjustment needed');
  }
  
  // Scenario 2: Next day (cross midnight)
  const endtimeInput2 = '01:00';
  const datetime2 = `${tanggal} ${endtimeInput2}`;
  let endTime2 = new Date(datetime2);
  
  console.log('\n--- Scenario 2: Next Day ---');
  console.log('Start Time:', startTime);
  console.log('End Time Input:', datetime2);
  console.log('End Time Object:', endTime2);
  console.log('End Time <= Start Time:', endTime2 <= startTime);
  
  if (endTime2 <= startTime) {
    endTime2.setDate(endTime2.getDate() + 1);
    console.log('Next day detected!');
    console.log('Adjusted End Time:', endTime2);
    console.log('Formatted End Time:', endTime2.toISOString().slice(0, 16).replace('T', ' '));
  } else {
    console.log('Same day - no adjustment needed');
  }
  
  console.log('\n=== TEST COMPLETED ===');
};

testNextDayValidation();