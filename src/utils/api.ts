// Add this function to your existing API utilities

/**
 * Get the URL for a student's selfie using the new database-backed endpoint
 */
export const getSelfieUrl = (attendanceId: number) => {
  return `${API_BASE_URL}/api/v1/attendance/selfie/${attendanceId}`;
};