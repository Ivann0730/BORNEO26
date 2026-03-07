"use client";

import { useCallback, useMemo } from "react";
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
}

const nodeTypes = { alternativePath: AlternativePathNode };

export default function DecisionTreeView({
    decisions,
    initialScore,
}: DecisionTreeViewProps) {
    const { nodes, edges } = useMemo(() => {
        const n: Node[] = [];
        const e: Edge[] = [];

        n.push({
            id: "start",
            type: "default",
            position: { x: 150, y: 0 },
            data: { label: `Start: ${initialScore}%` },
            style: {
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                borderRadius: "12px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
            },
        });

        decisions.forEach((d, i) => {
            const yOffset = (i + 1) * 140;
            const nodeId = `decision-${i}`;
            const altId = `alt-${i}`;
            const prevId = i === 0 ? "start" : `decision-${i - 1}`;

            n.push({
                id: nodeId,
                type: "default",
                position: { x: 150, y: yOffset },
                data: {
                    label: `${d.interpretation} (${d.scoreDelta >= 0 ? "+" : ""}${d.scoreDelta})`,
                },
                style: {
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    fontSize: "12px",
                    border: "1px solid var(--border)",
                    maxWidth: "200px",
                },
            });

            n.push({
                id: altId,
                type: "alternativePath",
                position: { x: 400, y: yOffset },
                data: { label: d.alternativeDecision },
            });

            e.push({
                id: `e-${prevId}-${nodeId}`,
                source: prevId,
                target: nodeId,
                style: { stroke: "var(--primary)" },
                animated: true,
            });

            e.push({
                id: `e-${nodeId}-${altId}`,
                source: nodeId,
                target: altId,
                style: { stroke: "var(--accent)", strokeDasharray: "5 5" },
            });
        });

        return { nodes: n, edges: e };
    }, [decisions, initialScore]);

    const onInit = useCallback(() => { }, []);

    return (
        <div className="w-full h-[400px] sm:h-[500px] rounded-2xl border border-border overflow-hidden bg-card">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onInit={onInit}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                proOptions={{ hideAttribution: true }}
            >
                <Background gap={16} size={1} />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    );
}
