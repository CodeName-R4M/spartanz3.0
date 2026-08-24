import Image from 'next/image'
import type { TeamMember } from '@/lib/types'

interface TeamMemberCardProps {
  member: TeamMember
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={member.photo || '/placeholder-user.jpg'}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-pretty font-sans text-base font-bold leading-tight text-foreground">
          {member.name}
        </h3>
        <p className="mt-1 text-sm text-primary">{member.role}</p>
        {member.shortBio ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {member.shortBio}
          </p>
        ) : null}
        {member.year ? (
          <p className="mt-auto pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {member.year}
          </p>
        ) : null}
      </div>
    </article>
  )
}
