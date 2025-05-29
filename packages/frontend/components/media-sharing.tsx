"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  ImageIcon,
  File,
  Video,
  Music,
  Download,
  Eye,
  Share,
  Trash,
  LinkIcon,
  Camera,
  Mic,
  FileText,
  Archive,
  Code,
} from "lucide-react"

interface MediaFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: Date
  uploadedBy: string
  description?: string
}

interface MediaSharingProps {
  channelId: string
  onFileUpload: (file: MediaFile) => void
}

export function MediaSharing({ channelId, onFileUpload }: MediaSharingProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    Array.from(selectedFiles).forEach((file) => {
      simulateUpload(file)
    })
  }

  const simulateUpload = (file: File) => {
    setUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)

          // Add file to list
          const newFile: MediaFile = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file),
            uploadedAt: new Date(),
            uploadedBy: "Current User",
          }

          setFiles((prev) => [...prev, newFile])
          onFileUpload(newFile)
          return 0
        }
        return prev + 10
      })
    }, 200)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />
    if (type.startsWith("audio/")) return <Music className="h-4 w-4" />
    if (type.includes("pdf")) return <FileText className="h-4 w-4" />
    if (type.includes("zip") || type.includes("rar")) return <Archive className="h-4 w-4" />
    if (type.includes("javascript") || type.includes("typescript") || type.includes("json"))
      return <Code className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileTypeColor = (type: string) => {
    if (type.startsWith("image/")) return "bg-green-100 text-green-800"
    if (type.startsWith("video/")) return "bg-purple-100 text-purple-800"
    if (type.startsWith("audio/")) return "bg-blue-100 text-blue-800"
    if (type.includes("pdf")) return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Media & File Sharing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
            <p className="text-muted-foreground mb-4">Drag and drop files here, or click to browse</p>

            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
                <File className="h-4 w-4" />
                Browse Files
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Mic className="h-4 w-4" />
                Record Audio
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Supported formats: Images, Videos, Audio, Documents, Archives (Max 100MB)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar,.json,.js,.ts,.jsx,.tsx"
            />
          </div>

          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Badge className={getFileTypeColor(file.type)}>{file.type.split("/")[0]}</Badge>
                  </div>

                  {file.type.startsWith("image/") && (
                    <div className="aspect-video bg-muted rounded overflow-hidden">
                      <ImageIcon
                        src={file.url || "/placeholder.svg"}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>by {file.uploadedBy}</span>
                    <span>{file.uploadedAt.toLocaleTimeString()}</span>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Share className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 text-red-600">
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Share Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Paste a link to share..." className="flex-1" />
            <Button>Share Link</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Links will be automatically previewed with title, description, and thumbnail
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
