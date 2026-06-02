import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsCard } from "./SettingsForms";
import { listAiVariables, upsertAiVariable, deleteAiVariable } from "@/lib/dashboard.functions";

interface Variable {
  id: string;
  variable_name: string;
  variable_value: string;
  description: string | null;
}

export function AiVariablesEditor() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAiVariables);
  const upsertFn = useServerFn(upsertAiVariable);
  const deleteFn = useServerFn(deleteAiVariable);

  const { data } = useQuery({ queryKey: ["ai-variables"], queryFn: () => listFn() });
  const [draft, setDraft] = useState({ variable_name: "", variable_value: "", description: "" });

  const upsert = useMutation({
    mutationFn: (v: { id?: string; variable_name: string; variable_value: string; description?: string }) =>
      upsertFn({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-variables"] });
      toast.success("Variable saved");
    },
    onError: () => toast.error("Invalid name — use UPPER_CASE letters, numbers, underscores"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-variables"] });
      toast.success("Variable deleted");
    },
  });

  const variables = (data?.variables ?? []) as Variable[];

  return (
    <SettingsCard
      title="AI Variables"
      description="Reusable values for prompts. Reference them as {{VARIABLE_NAME}} in the system prompt."
    >
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Value</th>
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {variables.map((v) => (
              <VariableRow key={v.id} variable={v} onSave={upsert.mutate} onDelete={remove.mutate} />
            ))}
            <tr className="bg-primary/5">
              <td className="px-3 py-2">
                <Input
                  placeholder="VARIABLE_NAME"
                  value={draft.variable_name}
                  onChange={(e) => setDraft((d) => ({ ...d, variable_name: e.target.value.toUpperCase() }))}
                  className="h-8 font-mono text-xs"
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  placeholder="Value"
                  value={draft.variable_value}
                  onChange={(e) => setDraft((d) => ({ ...d, variable_value: e.target.value }))}
                  className="h-8 text-xs"
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  placeholder="Description"
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  className="h-8 text-xs"
                />
              </td>
              <td className="px-3 py-2">
                <Button
                  size="sm"
                  className="h-8"
                  disabled={!draft.variable_name || !draft.variable_value}
                  onClick={() =>
                    upsert.mutate(draft, {
                      onSuccess: () => setDraft({ variable_name: "", variable_value: "", description: "" }),
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </SettingsCard>
  );
}

function VariableRow({
  variable,
  onSave,
  onDelete,
}: {
  variable: Variable;
  onSave: (v: { id: string; variable_name: string; variable_value: string; description?: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [value, setValue] = useState(variable.variable_value);
  const [desc, setDesc] = useState(variable.description ?? "");
  const dirty = value !== variable.variable_value || desc !== (variable.description ?? "");

  return (
    <tr className="border-b last:border-0">
      <td className="px-3 py-2 font-mono text-xs font-semibold">{variable.variable_name}</td>
      <td className="px-3 py-2">
        <Input value={value} onChange={(e) => setValue(e.target.value)} className="h-8 text-xs" />
      </td>
      <td className="px-3 py-2">
        <Input value={desc} onChange={(e) => setDesc(e.target.value)} className="h-8 text-xs" />
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-1">
          {dirty && (
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() =>
                onSave({ id: variable.id, variable_name: variable.variable_name, variable_value: value, description: desc })
              }
            >
              <Save className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-8 text-destructive" onClick={() => onDelete(variable.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
