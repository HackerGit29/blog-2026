export const STUDENT_AMBASSADOR_CONTRIBUTOR_ID = 'studentamb_516195';

export function appendContributorId(url: string, contributorId: string = STUDENT_AMBASSADOR_CONTRIBUTOR_ID): string {
  if (!contributorId) return url;
  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set('wt.mc_id', contributorId);
    return parsedUrl.toString();
  } catch (e) {
    // Fallback if URL is invalid
    return url.includes('?') 
      ? `${url}&wt.mc_id=${contributorId}`
      : `${url}?wt.mc_id=${contributorId}`;
  }
}
