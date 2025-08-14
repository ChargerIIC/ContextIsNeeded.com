export interface Question {
  title: string
  url: string
  site: string
}

export async function fetchAndParseCSV(url: string): Promise<Question[]> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`)
    }

    const csvText = await response.text()
    return parseCSV(csvText)
  } catch (error) {
    console.error("Error fetching CSV:", error)
    throw error
  }
}

function parseCSV(csvText: string): Question[] {
  const lines = csvText.trim().split("\n")
  const headers = lines[0].split(",").map((header) => header.trim().replace(/"/g, ""))

  const questions: Question[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    // Parse CSV line handling quoted values
    const values = parseCSVLine(line)

    if (values.length >= 3) {
      questions.push({
        title: values[0]?.trim().replace(/"/g, "") || "",
        url: values[1]?.trim().replace(/"/g, "") || "",
        site: values[2]?.trim().replace(/"/g, "") || "",
      })
    }
  }

  return questions.filter((q) => q.title && q.url && q.site)
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}
