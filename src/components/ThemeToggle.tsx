interface Props {
    theme: "light" | "dark";
    onToggle: () => void;
}
export default function ThemeToggle({ theme, onToggle }: Props) {
    return (
        <button
            className="button secondary"
            onClick={onToggle}
            aria-pressed={theme === "dark"}
            title="Toggle theme"
        >
            {theme === "light" ? "🌞 Light" : "🌙 Dark"}
        </button>
    );
}
