import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to: Date;
}

interface PeriodSelectorProps {
  selectedPeriod: DateRange;
  onPeriodChange: (period: DateRange) => void;
}

const PeriodSelector = ({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});

  const presetPeriods = [
    {
      label: "Hoje",
      getValue: () => ({ from: new Date(), to: new Date() })
    },
    {
      label: "Últimos 7 dias",
      getValue: () => ({ from: subDays(new Date(), 7), to: new Date() })
    },
    {
      label: "Últimos 30 dias",
      getValue: () => ({ from: subDays(new Date(), 30), to: new Date() })
    },
    {
      label: "Este mês",
      getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
    }
  ];

  const handlePresetClick = (getValue: () => DateRange) => {
    const period = getValue();
    onPeriodChange(period);
    setIsOpen(false);
  };

  const handleCustomRangeApply = () => {
    if (customRange.from && customRange.to) {
      onPeriodChange({ from: customRange.from, to: customRange.to });
      setIsOpen(false);
    }
  };

  const formatPeriodLabel = (period: DateRange) => {
    if (period.from.toDateString() === period.to.toDateString()) {
      return format(period.from, "dd/MM/yyyy", { locale: ptBR });
    }
    return `${format(period.from, "dd/MM", { locale: ptBR })} - ${format(period.to, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "justify-between min-w-[200px] bg-card hover:bg-muted/50 transition-colors",
            isOpen && "bg-muted/50"
          )}
        >
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{formatPeriodLabel(selectedPeriod)}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          {/* Preset periods */}
          <div className="border-r bg-muted/30 p-2">
            <div className="space-y-1">
              {presetPeriods.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => handlePresetClick(preset.getValue)}
                >
                  {preset.label}
                </Button>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Período personalizado:
                </div>
              </div>
            </div>
          </div>
          
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              defaultMonth={customRange.from}
              selected={{ from: customRange.from, to: customRange.to }}
              onSelect={(range) => {
                setCustomRange({ from: range?.from, to: range?.to });
              }}
              numberOfMonths={2}
              locale={ptBR}
              className="rounded-md border-0"
            />
            {customRange.from && customRange.to && (
              <div className="flex justify-end space-x-2 mt-3 pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCustomRange({})}
                >
                  Limpar
                </Button>
                <Button 
                  size="sm"
                  onClick={handleCustomRangeApply}
                  className="bg-primary text-primary-foreground"
                >
                  Aplicar
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PeriodSelector;