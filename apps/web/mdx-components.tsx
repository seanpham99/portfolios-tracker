import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mt-2 scroll-m-20 text-4xl font-bold tracking-tight text-emerald-400">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 scroll-m-20 border-b border-zinc-800 pb-1 text-3xl font-semibold tracking-tight text-white first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight text-white">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="leading-7 [&:not(:first-child)]:mt-6 text-zinc-300">
        {children}
      </p>
    ),
    a: ({ href, children }) => {
      const isInternal = href?.startsWith("/");
      if (isInternal) {
        return (
          <Link href={href as string} className="font-medium text-emerald-500 underline underline-offset-4 hover:text-emerald-400">
            {children}
          </Link>
        );
      }
      return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-medium text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
        >
          {children}
        </a>
      );
    },
    ul: ({ children }) => (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-zinc-300">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2 text-zinc-300">
        {children}
      </ol>
    ),
    code: ({ children }) => (
      <code className="relative rounded bg-zinc-900 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-zinc-300">
        {children}
      </code>
    ),
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
        {...(props as any)}
      />
    ),
    ...components,
  };
}
