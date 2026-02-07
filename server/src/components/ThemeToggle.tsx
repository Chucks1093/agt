"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const isDark = theme === "dark";

	return (
		<Button
			type='button'
			variant='outline'
			className='h-9 w-9 p-0'
			onClick={() => setTheme(isDark ? "light" : "dark")}
			aria-label='Toggle theme'
			title='Toggle theme'>
			{isDark ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
		</Button>
	);
}
