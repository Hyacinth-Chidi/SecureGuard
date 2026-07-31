"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/dashboard/States";
import { formatDate } from "@/lib/utils";

interface Simulation {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
  targetDepartments: string[];
  templateName: string;
  totalTargets: number;
  clicked: number;
  reported: number;
}

export default function AdminSimulationsPage() {
  const [simulations, setSimulations] = useState<Simulation[] | null>(null);

  useEffect(() => {
    fetchSimulations();
  }, []);

  const fetchSimulations = async () => {
    const res = await fetch("/api/simulations");
    if (res.ok) {
      const data = await res.json();
      setSimulations(data.simulations);
    }
  };

  const deleteSimulation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this simulation? All results will be lost.")) return;
    const res = await fetch(`/api/simulations/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchSimulations();
    }
  };

  return (
    <div>
      <PageHeader
        title="Simulations"
        description="Run and manage phishing campaigns."
        action={
          <Link href="/dashboard/admin/simulations/new">
            <Button variant="primary" className="gap-2">
              <Plus size={16} /> New Simulation
            </Button>
          </Link>
        }
      />

      <div className="p-4 md:p-8">
        {!simulations ? (
          <LoadingBlock />
        ) : simulations.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-border-dim bg-transparent">
            <h3 className="text-lg font-display font-semibold text-text-main mb-2">No simulations found</h3>
            <p className="text-sm text-text-muted mb-6">Create your first phishing simulation to start testing your users.</p>
            <Link href="/dashboard/admin/simulations/new">
              <Button variant="primary">Create Simulation</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {simulations.map((sim) => (
              <Card key={sim._id} className="p-0 overflow-hidden flex flex-col md:flex-row">
                <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display font-semibold text-text-main text-lg">{sim.name}</h3>
                    <Badge tone={sim.status === "running" ? "success" : "low"}>{sim.status}</Badge>
                  </div>
                  <p className="text-sm text-text-muted mb-4">
                    Template: <span className="text-text-main">{sim.templateName}</span> &bull; Target:{" "}
                    <span className="text-text-main">{sim.targetDepartments.join(", ")}</span>
                  </p>
                  
                  <div className="flex items-center gap-6 text-xs text-text-muted">
                    <span>Targets: <strong className="text-text-main">{sim.totalTargets}</strong></span>
                    <span>Clicked: <strong className="text-danger">{sim.clicked}</strong></span>
                    <span>Reported: <strong className="text-accent">{sim.reported}</strong></span>
                    <span>Date: <strong className="text-text-main">{formatDate(sim.createdAt)}</strong></span>
                  </div>
                </div>
                
                <div className="bg-background-muted p-4 md:p-6 flex flex-row md:flex-col items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-border-dim">
                  <Link href={`/dashboard/admin/simulations/${sim._id}`} className="w-full">
                    <Button variant="ghost" className="w-full justify-between gap-2">
                      View Results <ArrowRight size={14} />
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start text-danger hover:text-danger hover:bg-danger/10 gap-2" onClick={() => deleteSimulation(sim._id)}>
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
