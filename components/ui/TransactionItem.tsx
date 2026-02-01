import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import CurrencyAmount from "@/components/ui/CurrencyAmount";
import { cn } from "@/lib/utils";

interface TransactionItemProps {
    transaction: any;
    onClick?: () => void;
    showSelection?: boolean;
    isSelected?: boolean;
    onToggleSelection?: () => void;
}

export default function TransactionItem({
    transaction: t,
    onClick,
    showSelection,
    isSelected,
    onToggleSelection
}: TransactionItemProps) {

    // Determine Source Type Badge
    let sourceType = 'M'; // Manual by default
    if (t.source_email_id || t.payment_method === 'Email Sync') sourceType = 'E';
    else if (t.payment_method === 'Receipt Scanner' || t.payment_method === 'Camera') sourceType = 'C';
    else if (t.payment_method === 'Voice AI') sourceType = 'V';

    // Format Date & Time
    const dateObj = new Date(t.date || t.created_at);
    // Since 'date' might be YYYY-MM-DD (UTC midnight), we need to be careful with time.
    // If it's a pending transaction from email, it might have a full timestamp in 'date' or we fall back.
    // For now, we try to format time. If it results in 00:00 (midnight) and it looks like a pure date, maybe hide time?
    // The user explicitly requested time, so we'll try our best.

    let dateStr = "";
    if (isToday(dateObj)) dateStr = "Hoy";
    else if (isYesterday(dateObj)) dateStr = "Ayer";
    else dateStr = format(dateObj, "d MMM", { locale: es });

    const timeStr = format(dateObj, "h:mm a").toLowerCase();

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-3 flex items-center justify-between bg-muted/30 rounded-2xl relative transition-all active:scale-[0.99]",
                isSelected && "bg-primary/5 border border-primary/30",
                onClick && "cursor-pointer"
            )}
        >
            {/* Checkbox Overlay for Pending View */}
            {showSelection && onToggleSelection && (
                <div className="absolute top-3 right-3 z-10" onClick={(e) => { e.stopPropagation(); onToggleSelection(); }}>
                    <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                        isSelected ? "bg-primary border-primary text-white" : "border-muted-foreground/30 bg-background/50"
                    )}>
                        {isSelected && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-4">
                {/* 1. Top Line: Description (Truncated) */}
                <p className="font-bold text-sm leading-tight truncate text-foreground">
                    {t.description || t.category?.name || "Sin descripción"}
                </p>

                {/* 2. Bottom Line: Metadata */}
                <div className="flex items-center gap-2 text-[10px] whitespace-nowrap overflow-hidden">
                    {/* Date - Time */}
                    <span className="text-muted-foreground font-medium shrink-0">
                        {dateStr} - {timeStr}
                    </span>

                    {/* Category Badge */}
                    <span
                        className="px-1.5 py-0.5 rounded-[6px] font-bold text-white shrink-0 truncate max-w-[100px]"
                        style={{ backgroundColor: t.category?.color || '#94a3b8' }}
                    >
                        {t.category?.name || 'Varios'}
                    </span>

                    {/* Source Type Badge */}
                    <span className="w-4 h-4 rounded-full bg-foreground/10 text-foreground/70 flex items-center justify-center font-black text-[8px] shrink-0">
                        {sourceType}
                    </span>
                </div>
            </div>

            {/* Amount */}
            <CurrencyAmount
                amount={t.type === 'expense' ? -Math.abs(Number(t.amount)) : Math.abs(Number(t.amount))}
                colored={true}
                size="lg" // Keeping large size as requested implied context, though maybe md fits better with "small font" vibe? kept lg for contrast.
                className="font-black tabular-nums text-sm shrink-0"
            />
        </div>
    );
}
