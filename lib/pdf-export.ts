import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { format } from "date-fns"

// Configuration options for PDF export
interface PdfExportOptions {
  filename?: string
  pageTitle?: string
  includeTimestamp?: boolean
  orientation?: "portrait" | "landscape"
  pageSize?: "a4" | "letter" | "legal"
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

// Default options
const defaultOptions: PdfExportOptions = {
  filename: "report",
  pageTitle: "Restaurant Management System Report",
  includeTimestamp: true,
  orientation: "portrait",
  pageSize: "a4",
  margins: {
    top: 15,
    right: 15,
    bottom: 15,
    left: 15,
  },
}

/**
 * Exports a DOM element to PDF
 * @param element The DOM element to export
 * @param options PDF export options
 */
export async function exportToPdf(element: HTMLElement, options: PdfExportOptions = {}): Promise<void> {
  // Merge with default options
  const config = { ...defaultOptions, ...options }

  try {
    // Show loading indicator
    const loadingIndicator = document.createElement("div")
    loadingIndicator.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    loadingIndicator.innerHTML = `
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p class="text-gray-700 dark:text-gray-300">Generating PDF...</p>
      </div>
    `
    document.body.appendChild(loadingIndicator)

    // Get the current date and time for the filename
    const timestamp = config.includeTimestamp ? `-${format(new Date(), "yyyy-MM-dd-HHmm")}` : ""

    const filename = `${config.filename}${timestamp}.pdf`

    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: config.orientation,
      unit: "mm",
      format: config.pageSize,
    })

    // Set initial position
    let yPos = config.margins!.top

    // Add title
    if (config.pageTitle) {
      pdf.setFontSize(18)
      pdf.text(config.pageTitle, config.margins!.left, yPos)
      yPos += 10
    }

    // Add timestamp
    if (config.includeTimestamp) {
      pdf.setFontSize(10)
      pdf.text(`Generated on: ${format(new Date(), "PPpp")}`, config.margins!.left, yPos)
      yPos += 15
    }

    // Capture the element as an image
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable CORS for external images
      logging: false, // Disable logging
      allowTaint: true, // Allow tainted canvas
      backgroundColor: getComputedStyle(document.body).backgroundColor || "#ffffff",
    })

    // Calculate dimensions to fit within page
    const imgWidth = pdf.internal.pageSize.getWidth() - (config.margins!.left + config.margins!.right)
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Add the image to the PDF
    const imgData = canvas.toDataURL("image/png")
    pdf.addImage(imgData, "PNG", config.margins!.left, yPos, imgWidth, imgHeight)

    // Save the PDF
    pdf.save(filename)
  } catch (error) {
    console.error("Error generating PDF:", error)
    alert("An error occurred while generating the PDF. Please try again.")
  } finally {
    // Remove loading indicator
    const loadingIndicator = document.querySelector("div.fixed.inset-0.bg-black.bg-opacity-50")
    if (loadingIndicator && loadingIndicator.parentNode) {
      loadingIndicator.parentNode.removeChild(loadingIndicator)
    }
  }
}

/**
 * Exports multiple sections to a multi-page PDF
 * @param elements Array of DOM elements to export
 * @param options PDF export options
 */
export async function exportMultiSectionToPdf(elements: HTMLElement[], options: PdfExportOptions = {}): Promise<void> {
  // Merge with default options
  const config = { ...defaultOptions, ...options }

  try {
    // Show loading indicator
    const loadingIndicator = document.createElement("div")
    loadingIndicator.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    loadingIndicator.innerHTML = `
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p class="text-gray-700 dark:text-gray-300">Generating PDF...</p>
      </div>
    `
    document.body.appendChild(loadingIndicator)

    // Get the current date and time for the filename
    const timestamp = config.includeTimestamp ? `-${format(new Date(), "yyyy-MM-dd-HHmm")}` : ""

    const filename = `${config.filename}${timestamp}.pdf`

    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: config.orientation,
      unit: "mm",
      format: config.pageSize,
    })

    // Process each element
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]

      // Add a new page for each element except the first one
      if (i > 0) {
        pdf.addPage()
      }

      // Set initial position
      let yPos = config.margins!.top

      // Add title
      if (config.pageTitle) {
        pdf.setFontSize(18)
        pdf.text(config.pageTitle, config.margins!.left, yPos)
        yPos += 10
      }

      // Add timestamp
      if (config.includeTimestamp) {
        pdf.setFontSize(10)
        pdf.text(`Generated on: ${format(new Date(), "PPpp")}`, config.margins!.left, yPos)
        yPos += 15
      }

      // Add section title if available
      if (element.dataset.sectionTitle) {
        pdf.setFontSize(14)
        pdf.text(element.dataset.sectionTitle, config.margins!.left, yPos)
        yPos += 10
      }

      // Capture the element as an image
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: getComputedStyle(document.body).backgroundColor || "#ffffff",
      })

      // Calculate dimensions to fit within page
      const imgWidth = pdf.internal.pageSize.getWidth() - (config.margins!.left + config.margins!.right)
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add the image to the PDF
      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", config.margins!.left, yPos, imgWidth, imgHeight)
    }

    // Save the PDF
    pdf.save(filename)
  } catch (error) {
    console.error("Error generating multi-section PDF:", error)
    alert("An error occurred while generating the PDF. Please try again.")
  } finally {
    // Remove loading indicator
    const loadingIndicator = document.querySelector("div.fixed.inset-0.bg-black.bg-opacity-50")
    if (loadingIndicator && loadingIndicator.parentNode) {
      loadingIndicator.parentNode.removeChild(loadingIndicator)
    }
  }
}
