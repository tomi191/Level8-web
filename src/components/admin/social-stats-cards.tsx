"use client";

import { MessageSquare, Clock, AlertTriangle, Zap } from "lucide-react";
import { StatCard } from "./stat-card";

interface SocialStatsProps {
  totalConversations: number;
  activeConversations: number;
  pendingApprovals: number;
  escalated: number;
  messagesToday: number;
  messagesThisWeek: number;
}

export function SocialStatsCards(props: SocialStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard label="Активни чатове" value={props.activeConversations} icon={MessageSquare} />
      <StatCard label="За одобрение" value={props.pendingApprovals} icon={Clock} accent={props.pendingApprovals > 0} />
      <StatCard label="Ескалирани" value={props.escalated} icon={AlertTriangle} accent={props.escalated > 0} />
      <StatCard label="Днес съобщения" value={props.messagesToday} icon={Zap} />
    </div>
  );
}
