import { getPreviousMonthRangeIST } from '../lib/reports/monthly-lead-report';

function runTests() {
  console.log('Testing Monthly Report Date Range Calculation (IST)...');

  // Test 1: Given Jan 1, 2027 06:00 IST -> Previous month is Dec 2026
  const janDate = new Date(Date.UTC(2027, 0, 1, 0, 30, 0)); // 06:00 IST on Jan 1
  const decRange = getPreviousMonthRangeIST(janDate);
  console.log('Test 1 (Jan -> Dec):', decRange.periodLabel, decRange.year, decRange.month);
  if (decRange.year !== 2026 || decRange.month !== 12 || decRange.periodLabel !== 'December 2026') {
    throw new Error('Test 1 Failed');
  }

  // Test 2: Given Dec 1, 2026 06:00 IST -> Previous month is Nov 2026
  const decDate = new Date(Date.UTC(2026, 11, 1, 0, 30, 0)); // 06:00 IST on Dec 1
  const novRange = getPreviousMonthRangeIST(decDate);
  console.log('Test 2 (Dec -> Nov):', novRange.periodLabel, novRange.year, novRange.month);
  if (novRange.year !== 2026 || novRange.month !== 11 || novRange.periodLabel !== 'November 2026') {
    throw new Error('Test 2 Failed');
  }

  // Test 3: Check IST boundary start and end
  // Nov 1 00:00:00 IST is Oct 31 18:30:00 UTC
  // Nov 30 23:59:59.999 IST is Nov 30 18:29:59.999 UTC
  console.log('Start Date UTC:', novRange.startDate.toISOString());
  console.log('End Date UTC:', novRange.endDate.toISOString());

  if (novRange.startDate.toISOString() !== '2026-10-31T18:30:00.000Z') {
    throw new Error(`Start date UTC mismatch: got ${novRange.startDate.toISOString()}`);
  }
  if (novRange.endDate.toISOString() !== '2026-11-30T18:29:59.999Z') {
    throw new Error(`End date UTC mismatch: got ${novRange.endDate.toISOString()}`);
  }

  console.log('✅ All Monthly Report Date Range Tests Passed!');
}

runTests();
