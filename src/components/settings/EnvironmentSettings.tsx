import React from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

// 硬编码的环境变量，这些变量不允许用户编辑
const LOCKED_ENV_VARS: Record<string, string> = {
  "ANTHROPIC_BASE_URL": "https://cc.585dg.com",
};

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface EnvironmentSettingsProps {
  envVars: EnvironmentVariable[];
  addEnvVar: () => void;
  updateEnvVar: (id: string, field: "key" | "value" | "enabled", value: string | boolean) => void;
  removeEnvVar: (id: string) => void;
}

export const EnvironmentSettings: React.FC<EnvironmentSettingsProps> = ({
  envVars,
  addEnvVar,
  updateEnvVar,
  removeEnvVar
}) => {
  // 检查变量是否被锁定
  const isLocked = (key: string) => key in LOCKED_ENV_VARS;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">环境变量</h3>
            <p className="text-sm text-muted-foreground mt-1">
              应用于每个 Claude Code 会话的环境变量
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addEnvVar}
            className="gap-2"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            添加变量
          </Button>
        </div>

        <div className="space-y-3">
          {envVars.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              未配置环境变量。
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                💡 使用开关来启用或禁用环境变量。只有启用的变量会被应用到 Claude Code 会话中。
              </p>
              {envVars.map((envVar) => {
                const locked = isLocked(envVar.key);
                return (
                  <motion.div
                    key={envVar.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    {/* 启用/禁用开关 */}
                    <div className="flex items-center">
                      <Switch
                        checked={envVar.enabled}
                        onCheckedChange={(checked) => updateEnvVar(envVar.id, "enabled", checked)}
                        title={envVar.enabled ? "禁用环境变量" : "启用环境变量"}
                        className="scale-75"
                        disabled={locked}
                      />
                    </div>

                    <Input
                      placeholder="KEY"
                      value={envVar.key}
                      onChange={(e) => updateEnvVar(envVar.id, "key", e.target.value)}
                      className={`flex-1 font-mono text-sm ${!envVar.enabled || locked ? 'opacity-50' : ''}`}
                      disabled={!envVar.enabled || locked}
                    />
                    <span className={`text-muted-foreground ${!envVar.enabled || locked ? 'opacity-50' : ''}`}>=</span>
                    <Input
                      placeholder="value"
                      value={envVar.value}
                      onChange={(e) => updateEnvVar(envVar.id, "value", e.target.value)}
                      className={`flex-1 font-mono text-sm ${!envVar.enabled || locked ? 'opacity-50' : ''}`}
                      disabled={!envVar.enabled || locked}
                    />
                    {locked ? (
                      <div
                        className="h-8 w-8 flex items-center justify-center text-amber-500"
                        title="此变量已锁定，不可编辑"
                      >
                        <Lock className="h-4 w-4" aria-hidden="true" />
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEnvVar(envVar.id)}
                        className="h-8 w-8 hover:text-destructive"
                        aria-label="删除环境变量"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </>
          )}
        </div>

        <div className="pt-2 space-y-2">
          <p className="text-xs text-muted-foreground">
            <strong>常用变量:</strong>
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
            <li>• <code className="px-1 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">ANTHROPIC_API_KEY</code> - 您购买的秘钥 </li>
            <li>• <code className="px-1 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">CLAUDE_CODE_ENABLE_TELEMETRY</code> - 启用/禁用遥测 (0 或 1)</li>
            <li>• <code className="px-1 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">ANTHROPIC_MODEL</code> - 自定义模型名称</li>
            <li>• <code className="px-1 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">DISABLE_COST_WARNINGS</code> - 禁用费用警告 (1)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};