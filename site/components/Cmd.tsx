// Renders a shell command so lines wrap only between tokens, never inside
// short tokens such as "--skill"; long ones (slugs, URLs) may break anywhere.
export default function Cmd({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <span key={i} className="cmd-line">
          {line.split(' ').map((tok, j) => (
            <span key={j}>{j > 0 ? ' ' : ''}<span className={tok.length <= 24 ? 'tok' : undefined}>{tok}</span></span>
          ))}
        </span>
      ))}
    </>
  );
}
