// Export data utilities for CSV and PDF formats

/**
 * Export complaints to CSV format
 * @param {Array} complaints - Array of complaint objects
 * @param {string} filename - Name of the file to download
 */
export const exportToCSV = (complaints, filename = 'complaints_export.csv') => {
  if (!complaints || complaints.length === 0) {
    alert('No data to export')
    return
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Title',
    'Description',
    'Category',
    'Priority',
    'Status',
    'Location',
    'PIN Code',
    'Citizen Name',
    'Citizen Email',
    'Citizen Phone',
    'Department',
    'Assigned To',
    'Source',
    'Created Date',
    'Updated Date',
    'Updates Count',
  ]

  // Map complaints to CSV rows
  const rows = complaints.map(complaint => [
    complaint.id,
    complaint.title,
    complaint.description,
    complaint.category,
    complaint.priority,
    complaint.status,
    complaint.location || '',
    complaint.pinCode || '',
    complaint.citizenName,
    complaint.citizenEmail,
    complaint.citizenPhone,
    complaint.department || 'Not Assigned',
    complaint.assignedTo || 'Unassigned',
    complaint.source,
    new Date(complaint.createdAt).toLocaleDateString(),
    new Date(complaint.updatedAt).toLocaleDateString(),
    complaint.updates?.length || 0,
  ])

  // Convert to CSV string
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  // Create and download blob
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;')
}

/**
 * Export complaints to JSON format
 * @param {Array} complaints - Array of complaint objects
 * @param {string} filename - Name of the file to download
 */
export const exportToJSON = (complaints, filename = 'complaints_export.json') => {
  if (!complaints || complaints.length === 0) {
    alert('No data to export')
    return
  }

  const jsonContent = JSON.stringify(complaints, null, 2)
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;')
}

/**
 * Export complaints to PDF format
 * @param {Array} complaints - Array of complaint objects
 * @param {string} filename - Name of the file to download
 */
export const exportToPDF = (complaints, filename = 'complaints_export.pdf') => {
  if (!complaints || complaints.length === 0) {
    alert('No data to export')
    return
  }

  // Since we don't have a PDF library included, we'll create a formatted HTML
  // that can be printed to PDF using the browser's print functionality
  // Or we can create a simple text-based PDF

  let pdfContent = generatePDFContent(complaints)

  // Create blob and trigger download
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(pdfContent))
  element.setAttribute('download', filename.replace('.pdf', '.html'))
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)

  // Alert user they can print to PDF
  alert('Opening print dialog. Use "Save as PDF" in print options to save the file.')
  window.print()
}

/**
 * Generate HTML content for PDF export
 * @param {Array} complaints - Array of complaint objects
 * @returns {string} HTML string
 */
const generatePDFContent = (complaints) => {
  const currentDate = new Date().toLocaleDateString()
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Grievance Flow - Complaints Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          color: #1e40af;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .summary {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
        }
        .summary-item {
          padding: 10px 20px;
        }
        .summary-item label {
          font-weight: bold;
          color: #666;
        }
        .summary-item value {
          font-size: 1.2em;
          color: #3b82f6;
        }
        .complaint {
          page-break-inside: avoid;
          border: 1px solid #ddd;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 5px;
        }
        .complaint-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 10px;
        }
        .complaint-id {
          font-weight: bold;
          color: #1e40af;
          font-family: monospace;
        }
        .complaint-title {
          font-size: 1.1em;
          font-weight: bold;
          color: #000;
          margin-bottom: 5px;
        }
        .complaint-description {
          color: #666;
          margin-bottom: 10px;
          font-size: 0.95em;
        }
        .complaint-meta {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          font-size: 0.9em;
          margin-bottom: 10px;
        }
        .meta-item {
          background: #f9fafb;
          padding: 8px;
          border-left: 3px solid #3b82f6;
        }
        .meta-label {
          font-weight: bold;
          color: #666;
        }
        .meta-value {
          color: #333;
        }
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: bold;
          margin-right: 5px;
        }
        .badge-critical {
          background: #fee2e2;
          color: #991b1b;
        }
        .badge-high {
          background: #fed7aa;
          color: #92400e;
        }
        .badge-medium {
          background: #fef3c7;
          color: #92400e;
        }
        .badge-low {
          background: #d1fae5;
          color: #065f46;
        }
        .badge-pending {
          background: #fef3c7;
          color: #92400e;
        }
        .badge-in_progress {
          background: #dbeafe;
          color: #1e40af;
        }
        .badge-resolved {
          background: #d1fae5;
          color: #065f46;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #999;
          font-size: 0.9em;
        }
        @media print {
          body {
            margin: 0;
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>GrievanceFlow</h1>
        <h2>Complaints Report</h2>
        <p>Generated on ${currentDate}</p>
      </div>

      <div class="summary">
        <div class="summary-item">
          <label>Total Complaints:</label>
          <value>${complaints.length}</value>
        </div>
        <div class="summary-item">
          <label>Resolved:</label>
          <value>${complaints.filter(c => c.status === 'resolved').length}</value>
        </div>
        <div class="summary-item">
          <label>In Progress:</label>
          <value>${complaints.filter(c => c.status === 'in_progress').length}</value>
        </div>
        <div class="summary-item">
          <label>Pending:</label>
          <value>${complaints.filter(c => c.status === 'pending').length}</value>
        </div>
        <div class="summary-item">
          <label>Critical:</label>
          <value>${complaints.filter(c => c.priority === 'critical').length}</value>
        </div>
      </div>
  `

  // Add each complaint
  complaints.forEach(complaint => {
    const priorityBadgeClass = `badge-${complaint.priority}`
    const statusBadgeClass = `badge-${complaint.status}`

    html += `
      <div class="complaint">
        <div class="complaint-header">
          <div>
            <div class="complaint-id">${complaint.id}</div>
            <div class="complaint-title">${complaint.title}</div>
          </div>
        </div>
        <div class="complaint-description">${complaint.description}</div>
        
        <div>
          <span class="badge ${priorityBadgeClass}">${complaint.priority.toUpperCase()}</span>
          <span class="badge ${statusBadgeClass}">${complaint.status.replace('_', ' ').toUpperCase()}</span>
        </div>

        <div class="complaint-meta">
          <div class="meta-item">
            <div class="meta-label">Category</div>
            <div class="meta-value">${complaint.category}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Location</div>
            <div class="meta-value">${complaint.location}${complaint.pinCode ? ` (${complaint.pinCode})` : ''}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Citizen</div>
            <div class="meta-value">${complaint.citizenName}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Department</div>
            <div class="meta-value">${complaint.department || 'Not Assigned'}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Assigned To</div>
            <div class="meta-value">${complaint.assignedTo || 'Unassigned'}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Filed Date</div>
            <div class="meta-value">${new Date(complaint.createdAt).toLocaleDateString()}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Contact</div>
            <div class="meta-value">${complaint.citizenEmail}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Phone</div>
            <div class="meta-value">${complaint.citizenPhone}</div>
          </div>
        </div>

        ${complaint.updates && complaint.updates.length > 0 ? `
          <div style="margin-top: 10px;">
            <strong style="color: #666;">Recent Updates:</strong>
            <ul style="margin: 5px 0; padding-left: 20px; font-size: 0.9em; color: #666;">
              ${complaint.updates.slice(-3).map(u => `
                <li>${new Date(u.date).toLocaleDateString()} - ${u.message}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `
  })

  html += `
    <div class="footer">
      <p>This is an automatically generated report from GrievanceFlow</p>
      <p>For more information, visit the platform dashboard</p>
    </div>
    </body>
    </html>
  `

  return html
}

/**
 * Helper function to download a file
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} type - MIME type
 */
const downloadFile = (content, filename, type) => {
  const element = document.createElement('a')
  element.setAttribute('href', `data:${type}` + encodeURIComponent(content))
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

/**
 * Generate summary statistics from complaints
 * @param {Array} complaints - Array of complaint objects
 * @returns {Object} Statistics object
 */
export const generateSummary = (complaints) => {
  if (!complaints || complaints.length === 0) {
    return null
  }

  return {
    total: complaints.length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    pending: complaints.filter(c => c.status === 'pending').length,
    critical: complaints.filter(c => c.priority === 'critical').length,
    high: complaints.filter(c => c.priority === 'high').length,
    medium: complaints.filter(c => c.priority === 'medium').length,
    low: complaints.filter(c => c.priority === 'low').length,
    categories: Object.fromEntries(
      Object.entries(
        complaints.reduce((acc, c) => {
          acc[c.category] = (acc[c.category] || 0) + 1
          return acc
        }, {})
      ).sort(([, a], [, b]) => b - a)
    ),
    departments: Object.fromEntries(
      Object.entries(
        complaints.reduce((acc, c) => {
          const dept = c.department || 'Not Assigned'
          acc[dept] = (acc[dept] || 0) + 1
          return acc
        }, {})
      ).sort(([, a], [, b]) => b - a)
    ),
  }
}
