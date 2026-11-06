# usage-band

A Claude Code mod that shows your subscription rate-limit usage as colored bars in a band above the prompt:

```
5h ██░░░░░░░░ 23% (2h14m)  7d ████░░░░░░ 41% (3d5h)
```

- `5h` / `7d`: the five-hour and seven-day windows, with time until each resets.
- Bars are green, turn yellow at 70% and red at 90%.
- Updates after each turn and whenever a window moves. Hidden until the first reading arrives (and when you use an API key, which reports no rate-limit windows).

## Install

At the prompt of a terminal session:

```
/plugin install usage-band --marketplace dennydai77/usage-band
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install usage-band --marketplace dennydai77/usage-band
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `dennydai77/usage-band`, then Add plugin.
