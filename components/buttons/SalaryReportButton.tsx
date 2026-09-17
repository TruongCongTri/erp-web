import { trackUiEvent } from "@/utils/audit";

export function SalaryReportButton() {
  const handleDownload = async () => {
    // 1. Log the intent first
    await trackUiEvent("DOWNLOAD_FILE", "salary_report_Q3.pdf");

    // 2. Execute the actual local logic
    // generateAndDownloadPdf();
  };

  return <button onClick={handleDownload}>Download Salary Report</button>;
}
