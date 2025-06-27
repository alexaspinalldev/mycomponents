"use client"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"

type Option = {
    value: string
    label: string
}

type ComboboxProps = {
    title: string
    options: Option[]
    value?: Option
    onChange: (selected: Option) => void
    defaultValue?: string
    className?: string
}

export function Combobox({
    title,
    options,
    value,
    onChange,
    defaultValue,
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const defaultOption = options.find((option) => option.value === defaultValue)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className="flex justify-center">
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "overflow-hidden text-ellipsis whitespace-nowrap justify-start relative",
                            className
                        )}>
                        {value?.label || defaultOption?.label || `Select ${title}`}
                        <div className="size-fit rounded-md shadow-sm bg-white dark:bg-transparent absolute right-1">
                            <ChevronsUpDown className="m-1 h-4 w-4 shrink-0 opacity-50" />
                        </div>
                    </Button>
                </PopoverTrigger>
            </div>
            <PopoverContent className="w-full p-0 z-50">
                <Command>
                    <CommandInput placeholder="Search" autoFocus />
                    <CommandList>
                        <CommandEmpty>{`No ${title} found.`}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => {
                                        const selected = value?.value === option.value ? null : option
                                        if (selected) {
                                            onChange(selected)
                                        }
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value?.value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
