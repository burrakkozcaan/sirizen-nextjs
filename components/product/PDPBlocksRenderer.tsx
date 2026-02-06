import { PDPBlockRenderer } from "./PDPBlockRenderer";
import type { PDPBlock } from "@/actions/pdp.actions";

interface PDPBlocksRendererProps {
  blocksPromise: Promise<Record<string, PDPBlock[]>>;
  position: string;
}

export async function PDPBlocksRenderer({
  blocksPromise,
  position,
}: PDPBlocksRendererProps) {
  const blocks = await blocksPromise;
  const positionBlocks = blocks[position] || [];

  if (positionBlocks.length === 0) {
    return null;
  }

  return <PDPBlockRenderer blocks={positionBlocks} />;
}

