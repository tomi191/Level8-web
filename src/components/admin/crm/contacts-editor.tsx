"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CrmClientContact } from "@/types/crm";

interface ContactsEditorProps {
  initialContacts?: CrmClientContact[];
}

const EMPTY_CONTACT: CrmClientContact = {
  name: "",
  role: "",
  email: "",
  phone: "",
};

export function ContactsEditor({ initialContacts }: ContactsEditorProps) {
  const [contacts, setContacts] = useState<CrmClientContact[]>(
    initialContacts && initialContacts.length > 0 ? initialContacts : []
  );

  function addContact() {
    setContacts((prev) => [...prev, { ...EMPTY_CONTACT }]);
  }

  function removeContact(index: number) {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateContact(index: number, field: keyof CrmClientContact, value: string) {
    setContacts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  // Filter out contacts with empty names before serializing
  const validContacts = contacts.filter((c) => c.name.trim().length > 0);

  return (
    <div className="space-y-3">
      {/* Hidden input to submit JSON */}
      <input
        type="hidden"
        name="contacts"
        value={JSON.stringify(validContacts)}
      />

      {contacts.map((contact, idx) => (
        <div
          key={idx}
          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end p-3 rounded-lg border border-border/50 bg-background/50"
        >
          <div className="space-y-1">
            {idx === 0 && (
              <label className="font-mono text-[10px] text-muted-foreground/50 tracking-wider block">
                ИМЕ
              </label>
            )}
            <Input
              value={contact.name}
              onChange={(e) => updateContact(idx, "name", e.target.value)}
              placeholder="Име на контакт"
              className="bg-background border-border focus:border-neon/50 h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            {idx === 0 && (
              <label className="font-mono text-[10px] text-muted-foreground/50 tracking-wider block">
                РОЛЯ
              </label>
            )}
            <Input
              value={contact.role ?? ""}
              onChange={(e) => updateContact(idx, "role", e.target.value)}
              placeholder="Роля / длъжност"
              className="bg-background border-border focus:border-neon/50 h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            {idx === 0 && (
              <label className="font-mono text-[10px] text-muted-foreground/50 tracking-wider block">
                EMAIL
              </label>
            )}
            <Input
              type="email"
              value={contact.email ?? ""}
              onChange={(e) => updateContact(idx, "email", e.target.value)}
              placeholder="email@example.com"
              className="bg-background border-border focus:border-neon/50 h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            {idx === 0 && (
              <label className="font-mono text-[10px] text-muted-foreground/50 tracking-wider block">
                ТЕЛЕФОН
              </label>
            )}
            <Input
              type="tel"
              value={contact.phone ?? ""}
              onChange={(e) => updateContact(idx, "phone", e.target.value)}
              placeholder="+359 ..."
              className="bg-background border-border focus:border-neon/50 h-8 text-sm"
            />
          </div>

          <div className={cn(idx === 0 ? "mt-4" : "")}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeContact(idx)}
              className="h-8 w-8 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
            >
              <X size={14} />
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addContact}
        className="border-neon/20 text-neon hover:bg-neon/10 h-8 text-xs"
      >
        <Plus size={12} className="mr-1.5" />
        Добави контакт
      </Button>
    </div>
  );
}
