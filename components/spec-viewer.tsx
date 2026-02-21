"use client"

import { useState, useCallback, useMemo } from "react"
import { ChevronDown, BookOpen, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { RagButton, type RagStatus } from "@/components/rag-button"
import { MasteryBar } from "@/components/mastery-bar"
import specData from "@/lib/physics-spec.json"

type Ratings = Record<string, RagStatus>

interface SpecItemValue {
  content?: string
  opportunity?: string
  [key: string]: unknown
}

type SpecNode = Record<string, SpecItemValue | Record<string, unknown>>

function isLeafNode(value: unknown): value is SpecItemValue {
  if (typeof value !== "object" || value === null) return false
  return "content" in value && typeof (value as SpecItemValue).content === "string"
}

function collectLeafKeys(node: SpecNode, prefix: string): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(node)) {
    const fullKey = `${prefix}/${key}`
    if (isLeafNode(value)) {
      keys.push(fullKey)
    } else if (typeof value === "object" && value !== null) {
      keys.push(...collectLeafKeys(value as SpecNode, fullKey))
    }
  }
  return keys
}

function countRatings(leafKeys: string[], ratings: Ratings) {
  let red = 0
  let amber = 0
  let green = 0
  for (const key of leafKeys) {
    const r = ratings[key]
    if (r === "red") red++
    else if (r === "amber") amber++
    else if (r === "green") green++
  }
  return { red, amber, green, total: leafKeys.length }
}

// A single spec point card - title + RAG always visible, content accordions open
function SpecCard({
  id,
  title,
  content,
  rating,
  onRatingChange,
}: {
  id: string
  title: string
  content: string
  rating: RagStatus
  onRatingChange: (id: string, status: RagStatus) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const shortTitle = title.replace(/^\d+\.\d+\.\d+\.?\d*\s*/, "").replace(/\s*\(A-level only\)/, "")
  const isA2 = title.includes("A-level only")
  const number = title.match(/^(\d+\.\d+\.\d+\.?\d*)/)?.[1] || ""

  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-all duration-200",
        "hover:shadow-md",
        rating === "green" && "border-rag-green-active/40 bg-rag-green/10",
        rating === "amber" && "border-rag-amber-active/40 bg-rag-amber/10",
        rating === "red" && "border-rag-red-active/40 bg-rag-red/10",
        !rating && "border-border/60"
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
        >
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
              isOpen && "rotate-180"
            )}
          />
          {number && (
            <span className="text-[11px] font-mono text-muted-foreground shrink-0">
              {number}
            </span>
          )}
          <p className="text-sm font-medium text-card-foreground leading-snug truncate">
            {shortTitle || title}
          </p>
          {isA2 && (
            <span className="text-[9px] font-bold uppercase tracking-wider bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full shrink-0">
              A2
            </span>
          )}
        </button>
        <RagButton status={rating} onChange={(s) => onRatingChange(id, s)} />
      </div>
      {isOpen && (
        <div className="px-3 pb-3 pt-0">
          <div className="rounded-lg bg-muted/40 p-3 ml-6">
            <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Recursively flatten a SpecNode into an array of leaf items
function flattenLeaves(
  node: SpecNode,
  prefix: string
): { id: string; title: string; content: string }[] {
  const items: { id: string; title: string; content: string }[] = []
  for (const [key, value] of Object.entries(node)) {
    const fullKey = `${prefix}/${key}`
    if (isLeafNode(value)) {
      items.push({ id: fullKey, title: key, content: value.content || "" })
    } else if (typeof value === "object" && value !== null) {
      items.push(...flattenLeaves(value as SpecNode, fullKey))
    }
  }
  return items
}

// Section header for grouping (topics like "3.2.1 Particles")
function SectionHeader({
  title,
  leafKeys,
  ratings,
}: {
  title: string
  leafKeys: string[]
  ratings: Ratings
}) {
  const { red, amber, green, total } = useMemo(
    () => countRatings(leafKeys, ratings),
    [leafKeys, ratings]
  )
  const shortTitle = title.replace(/^\d+\.\d+\.?\d*\s*/, "").replace(/\s*\(A-level only\)/, "")
  const number = title.match(/^(\d+\.\d+\.?\d*)/)?.[1] || ""
  const isA2 = title.includes("A-level only")

  return (
    <div className="pt-2 pb-1">
      <div className="flex items-center gap-2 mb-2">
        {number && (
          <span className="text-xs font-mono text-primary/70 font-semibold">{number}</span>
        )}
        <h3 className="text-sm font-bold text-card-foreground">{shortTitle}</h3>
        {isA2 && (
          <span className="text-[9px] font-bold uppercase tracking-wider bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full shrink-0">
            A2
          </span>
        )}
      </div>
      <MasteryBar red={red} amber={amber} green={green} total={total} />
    </div>
  )
}

// A topic block: shows the topic title + all its sub-subtopic cards flat
function TopicBlock({
  title,
  node,
  ratings,
  onRatingChange,
}: {
  title: string
  node: SpecNode
  ratings: Ratings
  onRatingChange: (id: string, status: RagStatus) => void
}) {
  const parentKey = title
  const leafKeys = useMemo(() => collectLeafKeys(node, parentKey), [node, parentKey])
  const { red, amber, green, total } = useMemo(
    () => countRatings(leafKeys, ratings),
    [leafKeys, ratings]
  )

  const shortTitle = title.replace(/^\d+\.\d+\s*/, "").replace(/\s*\(A-level only\)/, "")
  const number = title.match(/^(\d+\.\d+)/)?.[1] || ""
  const isALevelOnly = title.includes("A-level only")

  // Build sections: either direct leaf items, or grouped sub-sections
  const sections = useMemo(() => {
    const result: {
      type: "leaf" | "group"
      key: string
      title: string
      leaves: { id: string; title: string; content: string }[]
      leafKeys: string[]
    }[] = []

    for (const [key, value] of Object.entries(node)) {
      const fullKey = `${parentKey}/${key}`
      if (isLeafNode(value)) {
        result.push({
          type: "leaf",
          key: fullKey,
          title: key,
          leaves: [{ id: fullKey, title: key, content: value.content || "" }],
          leafKeys: [fullKey],
        })
      } else if (typeof value === "object" && value !== null) {
        const subNode = value as SpecNode
        const leaves = flattenLeaves(subNode, fullKey)
        const keys = collectLeafKeys(subNode, fullKey)
        result.push({
          type: "group",
          key: fullKey,
          title: key,
          leaves,
          leafKeys: keys,
        })
      }
    }
    return result
  }, [node, parentKey])

  return (
    <section className="rounded-2xl border-2 border-border bg-card shadow-sm overflow-hidden">
      {/* Topic header - always visible */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {number && (
              <span className="text-xs font-mono text-primary/60 font-semibold">{number}</span>
            )}
            <h2 className="text-base font-bold text-card-foreground text-balance">{shortTitle}</h2>
            {isALevelOnly && (
              <span className="text-[10px] font-semibold uppercase tracking-wide bg-accent text-accent-foreground px-2 py-0.5 rounded-full shrink-0">
                A2
              </span>
            )}
          </div>
        </div>
        <MasteryBar red={red} amber={amber} green={green} total={total} />
      </div>

      {/* All sub-subtopic cards - always visible */}
      <div className="px-4 pb-4 flex flex-col gap-1.5">
        {sections.map((section) => {
          if (section.type === "leaf") {
            return (
              <SpecCard
                key={section.key}
                id={section.key}
                title={section.leaves[0].title}
                content={section.leaves[0].content}
                rating={ratings[section.key] || null}
                onRatingChange={onRatingChange}
              />
            )
          }
          // Group: show a sub-section header then its leaf cards
          return (
            <div key={section.key} className="flex flex-col gap-1.5">
              <SectionHeader
                title={section.title}
                leafKeys={section.leafKeys}
                ratings={ratings}
              />
              {section.leaves.map((leaf) => (
                <SpecCard
                  key={leaf.id}
                  id={leaf.id}
                  title={leaf.title}
                  content={leaf.content}
                  rating={ratings[leaf.id] || null}
                  onRatingChange={onRatingChange}
                />
              ))}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function SpecViewer() {
  const [ratings, setRatings] = useState<Ratings>({})

  const onRatingChange = useCallback((id: string, status: RagStatus) => {
    setRatings((prev) => ({ ...prev, [id]: status }))
  }, [])

  const allLeafKeys = useMemo(() => {
    const keys: string[] = []
    for (const [topicKey, topicValue] of Object.entries(specData)) {
      if (typeof topicValue === "object" && topicValue !== null) {
        keys.push(...collectLeafKeys(topicValue as SpecNode, topicKey))
      }
    }
    return keys
  }, [])

  const overall = useMemo(() => countRatings(allLeafKeys, ratings), [allLeafKeys, ratings])
  const masteryPercent =
    overall.total > 0 ? Math.round((overall.green / overall.total) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">specmap</h1>
                <p className="text-[11px] text-muted-foreground font-medium">AQA A-Level Physics</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground font-mono">{masteryPercent}%</p>
              <p className="text-[11px] text-muted-foreground">mastered</p>
            </div>
          </div>
          <div className="mt-3">
            <MasteryBar
              red={overall.red}
              amber={overall.amber}
              green={overall.green}
              total={overall.total}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5 pb-24">
        {Object.entries(specData).map(([topicKey, topicValue]) => {
          if (typeof topicValue !== "object" || topicValue === null) return null
          if (Object.keys(topicValue).length === 0) return null
          return (
            <TopicBlock
              key={topicKey}
              title={topicKey}
              node={topicValue as SpecNode}
              ratings={ratings}
              onRatingChange={onRatingChange}
            />
          )
        })}
      </main>
    </div>
  )
}
