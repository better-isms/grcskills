import Link from 'next/link';
import Cmd from './Cmd';
import { frameworkLabel, getAuthor, installCommands, type Skill } from '@/lib/content';

// The featured card from direction A.
export default function SkillCard({ skill }: { skill: Skill }) {
  const author = getAuthor(skill.author);
  return (
    <article className="sk">
      <div className="sk-top">
        <Link className="sk-cat" href={`/category/${skill.category}/`}>{skill.categoryLabel}</Link>
        <span className="sk-tags">
          {skill.frameworks.filter((f) => f !== 'general').slice(0, 3).map((f) => (
            <span className="tag" key={f}>{frameworkLabel(f)}</span>
          ))}
        </span>
      </div>
      <h3 className="sk-title"><Link href={`/skill/${skill.slug}/`}>{skill.title}</Link></h3>
      <p className="sk-desc">{skill.summary}</p>
      {author && (
        <div className="by">
          <span className="av" aria-hidden="true">{author.initials}</span>
          <span className="who"><b>{author.name}</b><small>{author.title}</small></span>
        </div>
      )}
      <code className="sk-cmd"><Cmd text={installCommands(skill.slug).npx} /></code>
      <div className="sk-foot"><span>MIT licensed</span><Link href={`/skill/${skill.slug}/`}>Read the skill</Link></div>
    </article>
  );
}
