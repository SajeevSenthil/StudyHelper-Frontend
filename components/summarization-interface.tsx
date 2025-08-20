"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Brain, ExternalLink, Save, Loader2 } from "lucide-react"

interface SummaryResult {
  summary: string
  resources?: Array<{ title: string; url: string; description: string }>
}

export function SummarizationInterface() {
  const [textInput, setTextInput] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveTitle, setSaveTitle] = useState("")
  const { toast } = useToast()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        const validTypes = [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ]
        if (validTypes.includes(file.type)) {
          setUploadedFile(file)
          setTextInput("") // Clear text input when file is uploaded
          // Auto-populate title with filename (without extension)
          const fileName = file.name.replace(/\.[^/.]+$/, "")
          setSaveTitle(fileName)
          toast({
            title: "File uploaded",
            description: `${file.name} is ready for summarization`,
          })
        } else {
          toast({
            title: "Invalid file type",
            description: "Please upload PDF, DOCX, or TXT files only",
            variant: "destructive",
          })
        }
      }
    },
    [toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    multiple: false,
  })

  const handleSummarize = async () => {
    if (!textInput.trim() && !uploadedFile) {
      toast({
        title: "No content to summarize",
        description: "Please upload a file or enter text",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      if (uploadedFile) {
        formData.append("file", uploadedFile)
      } else {
        formData.append("text", textInput)
      }

      const response = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to summarize")
      }

      const result = await response.json()
      setSummaryResult({ summary: result.summary })

      toast({
        title: "Summary generated",
        description: "Your content has been successfully summarized",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetResources = async () => {
    if (!summaryResult?.summary) {
      toast({
        title: "No summary available",
        description: "Please generate a summary first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: summaryResult.summary }),
      })

      if (!response.ok) {
        throw new Error("Failed to get resources")
      }

      const result = await response.json()
      setSummaryResult((prev) => (prev ? { ...prev, resources: result.resources } : null))

      toast({
        title: "Resources found",
        description: "Study resources have been added to your summary",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get resources. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!summaryResult?.summary) {
      toast({
        title: "No summary to save",
        description: "Please generate a summary first",
        variant: "destructive",
      })
      return
    }

    if (!saveTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your summary",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Prepare data in the format expected by backend
      const saveData = {
        topic: saveTitle.trim(),
        original_content: textInput || uploadedFile?.name || "File upload",
        summary: summaryResult.summary,
        resources: summaryResult.resources?.map(r => r.url) || []
      }

      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save")
      }

      const result = await response.json()
      
      toast({
        title: "Summary saved",
        description: `Your summary "${saveTitle}" has been saved to your library`,
      })

      // Clear the title after successful save
      setSaveTitle("")
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save summary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {uploadedFile ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {isDragActive ? "Drop the file here..." : "Drag & drop a file here, or click to select"}
                </p>
                <p className="text-xs text-gray-500">Supports PDF, DOCX, and TXT files</p>
              </div>
            )}
          </div>
          {uploadedFile && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 bg-transparent"
              onClick={() => {
                setUploadedFile(null)
                toast({ title: "File removed", description: "You can now upload a new file or enter text" })
              }}
            >
              Remove File
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Text Input Area */}
      {!uploadedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Or Enter Text Directly</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your text here for summarization..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-32"
            />
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={handleSummarize} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
          Summarize
        </Button>
        <Button onClick={handleGetResources} disabled={isLoading || !summaryResult?.summary} variant="outline">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-2" />}
          Get Resources
        </Button>
      </div>

      {/* Save Section - Only show if summary exists */}
      {summaryResult?.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Save Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="saveTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Title for your summary
                </label>
                <Input
                  id="saveTitle"
                  placeholder="Enter a title for your summary (e.g., 'Machine Learning Fundamentals')"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                />
              </div>
              <Button onClick={handleSave} disabled={isSaving || !saveTitle.trim()} className="w-full">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save to Library
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Results */}
      {summaryResult && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{summaryResult.summary}</p>
            </div>

            {summaryResult.resources && summaryResult.resources.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Study Resources</h4>
                <div className="space-y-3">
                  {summaryResult.resources.map((resource, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-1">{resource.title}</h5>
                          <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                          <Badge variant="secondary" className="text-xs">
                            External Resource
                          </Badge>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
