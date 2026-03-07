"use client";

import { GitBranch } from "lucide-react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export default function AlternativePathNode({ data }: NodeProps) {
    return (
        <div className="rounded-xl border border-dashed border-accent/50 bg-accent/5 px-3 py-2 max-w-[180px] shadow-sm">
            <Handle type="target" position={Position.Left} className="opacity-0" />
            <div className="flex items-start gap-1.5">
                <GitBranch className="h-3 w-3 text-accent mt-0.5 shrink-0" />
                <span className="text-[11px] text-muted-foreground leading-snug">
                    {(data as { label?: string }).label ?? ""}
                </span>
            </div>
        </div>
    );
}
