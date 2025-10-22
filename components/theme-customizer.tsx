'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { useLocale, useT } from '@/lib/locale';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const t = useT();

  return (
    <div className="fixed top-4 left-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Settings" className="w-8 h-8 sm:w-9 sm:h-9">
            <span className="text-lg sm:text-xl">⚙</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent side="bottom" className="w-44 sm:w-48">
          <div className="space-y-3">
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">
                {t('settings.themeLabel')}
              </label>
              <Select
                value={mounted ? theme : ''}
                onValueChange={(v: string) => setTheme(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    {t('settings.theme.light')}
                  </SelectItem>
                  <SelectItem value="dark">
                    {t('settings.theme.dark')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">
                {t('settings.languageLabel')}
              </label>
              <Select
                value={locale}
                onValueChange={(v: string) => setLocale(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    {t('settings.language.en')}
                  </SelectItem>
                  <SelectItem value="de">
                    {t('settings.language.de')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}