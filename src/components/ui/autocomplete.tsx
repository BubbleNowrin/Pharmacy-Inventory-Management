'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  subtitle?: string;
  badge?: string;
  data?: any;
}

interface AutocompleteProps {
  options: Option[];
  value?: string;
  onSelect: (value: string, option: Option) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function Autocomplete({
  options,
  value,
  onSelect,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled = false,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedOption = options.find((option) => option.value === value);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    onSelect(option.value, option);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedOption ? (
            <div className="flex items-center gap-2 flex-1 text-left">
              <span className="truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" sideOffset={4} style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto overflow-x-hidden">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "relative flex items-center justify-between rounded-sm px-2 py-2 text-sm cursor-pointer select-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground",
                      value === option.value && "bg-accent"
                    )}
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate">{option.label}</span>
                      {option.subtitle && (
                        <span className="text-sm text-muted-foreground truncate">{option.subtitle}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      {option.badge && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded whitespace-nowrap">
                          {option.badge}
                        </span>
                      )}
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}