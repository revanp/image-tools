export interface ConvertedPdfImage {
  name: string;
  originalSize: number; // Size of the PDF file (approximate per page)
  convertedSize: number;
  url: string;
  pageNumber: number;
  totalPages: number;
}
