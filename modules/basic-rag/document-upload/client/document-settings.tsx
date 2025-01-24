"use client"

import React from "react"
import { Input } from "@/shared/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/shared/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const settingsSchema = z.object({
  chunkSize: z.number().min(500).max(4000).default(1200),
  overlapSize: z.number().min(0).max(2000).default(200)
})

export type DocumentSettings = z.infer<typeof settingsSchema>

interface DocumentSettingsProps {
  onSettingsChange: (settings: DocumentSettings) => void
}

export function DocumentSettings({ onSettingsChange }: DocumentSettingsProps) {
  const form = useForm<DocumentSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      chunkSize: 1000,
      overlapSize: 500
    }
  })

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.chunkSize && value.overlapSize) {
        onSettingsChange(value as DocumentSettings)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, onSettingsChange])

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="chunkSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chunk Size (in tokens)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  500-1,200 tokens is best for shorter documents (few pages) and balances context capture with efficiency. 2,000-4,000 tokens is better for longer documents (10+ pages) but more computationally expensive and captures more context.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="overlapSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overlap Size (in tokens)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Choose based on your content structure. 10-20% of chunk size is recommended for most cases and ensures basic context preservation between chunks. 30-50% of chunk size is better for content with important cross-boundary context or complex dependencies.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  )
}
