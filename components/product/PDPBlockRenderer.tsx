import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PDPBlock } from "@/actions/pdp.actions";
import * as Icons from "lucide-react";

interface PDPBlockRendererProps {
  blocks: PDPBlock[];
}

export function PDPBlockRenderer({ blocks }: PDPBlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map((block) => (
        <BlockComponent key={block.id} block={block} />
      ))}
    </>
  );
}

function BlockComponent({ block }: { block: PDPBlock }) {
  // Get icon component dynamically
  const IconComponent = block.icon
    ? (Icons as any)[block.icon as keyof typeof Icons]
    : null;

  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/20",
    danger: "bg-red-100 text-red-600 border-red-200",
    warning: "bg-yellow-100 text-yellow-600 border-yellow-200",
    success: "bg-green-100 text-green-600 border-green-200",
    info: "bg-blue-100 text-blue-600 border-blue-200",
  };

  const colorClass = colorClasses[block.color as keyof typeof colorClasses] || colorClasses.primary;

  switch (block.type) {
    case "banner":
      return (
        <div className={`rounded-lg border p-4 ${colorClass}`}>
          {block.image && (
            <img
              src={block.image}
              alt={block.title || ""}
              className="w-full h-auto rounded mb-2"
            />
          )}
          {IconComponent && (
            <IconComponent className="w-5 h-5 mb-2" />
          )}
          {block.title && (
            <h4 className="font-semibold mb-1">{block.title}</h4>
          )}
          {block.description && (
            <p className="text-sm mb-2">{block.description}</p>
          )}
          {block.cta_text && block.cta_link && (
            <Link href={block.cta_link}>
              <Button variant="outline" size="sm">
                {block.cta_text}
              </Button>
            </Link>
          )}
        </div>
      );

    case "badge":
      return (
        <Badge variant="secondary" className={`${colorClass} border`}>
          {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
          {block.title}
        </Badge>
      );

    case "shipping":
      return (
        <div className="border rounded-lg p-4 space-y-2">
          {IconComponent && (
            <div className="flex items-center gap-2">
              <IconComponent className="w-5 h-5 text-primary" />
              {block.title && (
                <span className="font-semibold">{block.title}</span>
              )}
            </div>
          )}
          {block.description && (
            <p className="text-sm text-muted-foreground">{block.description}</p>
          )}
        </div>
      );

    case "advantage":
      return (
        <div className={`rounded-lg border p-3 ${colorClass}`}>
          <div className="flex items-start gap-3">
            {IconComponent && (
              <IconComponent className="w-5 h-5 mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              {block.title && (
                <h4 className="font-medium text-sm mb-1">{block.title}</h4>
              )}
              {block.description && (
                <p className="text-xs">{block.description}</p>
              )}
            </div>
          </div>
        </div>
      );

    case "notice":
      return (
        <div className="border rounded-lg p-3 bg-muted/50">
          {block.title && (
            <p className="text-sm font-medium mb-1">{block.title}</p>
          )}
          {block.description && (
            <p className="text-xs text-muted-foreground">{block.description}</p>
          )}
        </div>
      );

    default:
      return null;
  }
}

