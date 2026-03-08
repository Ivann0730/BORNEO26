"use client";

import { useCallback, useMemo, useState } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    type Node,
    type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import AlternativePathNode from "./AlternativePathNode";
import type { DecisionResult } from "@/types";

interface DecisionTreeViewProps {
    decisions: DecisionResult[];
    initialScore: number;
    isFailed?: boolean;
}

const nodeTypes = { alternativePath: AlternativePathNode };

export default function DecisionTreeView({
    decisions,
    initialScore,
    isFailed = false,
}: DecisionTreeViewProps) {
    const [hoveredAlt, setHoveredAlt] = useState<string | null>(null);

    const { nodes, edges } = useMemo(() => {
        const n: Node[] = [];
        const e: Edge[] = [];

        n.push({
            id: "start",
            type: "default",
            position: { x: 150, y: 0 },
            data: { label: `Start: ${initialScore}%` },
            style: {
                background: "#14B8A6",
                color: "white",
                borderRadius: "50%",
                width: 80,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                border: "3px solid #0d9488",
            },
        });

        decisions.forEach((d, i) => {
            const yOffset = (i + 1) * 160;
            const nodeId = `decision-${i}`;
            const altId = `alt-${i}`;
            const prevId = i === 0 ? "start" : `decision-${i - 1}`;

            const isNegative = d.scoreDelta < 0;
            const deltaLabel = `${d.scoreDelta >= 0 ? "+" : ""}${d.scoreDelta}`;
            const isFailNode = isFailed && i === decisions.length - 1;

            n.push({
                id: nodeId,
                type: "default",
                position: { x: 150, y: yOffset },
                data: {
                    label: `${d.interpretation}\n${deltaLabel}`,
                },
                style: {
                    background: isFailNode ? "#ff4444" : "#00e5ff",
                    color: isFailNode ? "white" : "#0d1b2a",
                    borderRadius: "50%",
                    width: 90,
                    height: 90,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 600,
                    textAlign: "center" as const,
                    border: isFailNode
                        ? "3px solid #cc0000"
                        : isNegative
                          ? "3px solid #f59e0b"
                          : "3px solid #0ea5e9",
                    padding: "8px",
                    lineHeight: "1.2",
                    maxWidth: "90px",
                    overflow: "hidden",
                },
            });

            n.push({
                id: altId,
                type: "alternativePath",
                position: { x: 380, y: yOffset + 15 },
                data: { label: d.alternativeDecision },
            });

            e.push({
                id: `e-${prevId}-${nodeId}`,
                source: prevId,
                target: nodeId,
                style: { stroke: "#00e5ff", strokeWidth: 2 },
                animated: true,
            });

            e.push({
                id: `e-${nodeId}-${altId}`,
                source: nodeId,
                target: altId,
                style: {
                    stroke: "var(--accent)",
                    strokeDasharray: "5 5",
                    strokeWidth: 1,
                },
            });
        });

        return { nodes: n, edges: e };
    }, [decisions, initialScore, isFailed]);

    const onInit = useCallback(() => {}, []);

    return (
        <div className="relative w-full h-[400px] sm:h-[500px] rounded-2xl border border-border overflow-hidden bg-card">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onInit={onInit}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                proOptions={{ hideAttribution: true }}
                onNodeMouseEnter={(_, node) => {
                    if (node.id.startsWith("alt-")) setHoveredAlt(node.id);
                }}
                onNodeMouseLeave={() => setHoveredAlt(null)}
            >
                <Background gap={16} size={1} />
                <Controls showInteractive={false} />
            </ReactFlow>

            {/* Tooltip */}
            {hoveredAlt && (
                <div className="absolute top-4 right-4 max-w-[200px] rounded-xl bg-accent/10 border border-accent/30 p-3 text-xs text-accent z-50 animate-in fade-in duration-150">
                    <span className="font-semibold">What if?</span>
                    <span className="block mt-1 text-foreground/70">
                        {decisions[parseInt(hoveredAlt.split("-")[1])]?.alternativeDecision}
                    </span>
                </div>
            )}
        </div>
    );
}
