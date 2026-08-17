<script lang="ts">
  const nav = [
    {
      heading: 'Overview',
      links: [
        { title: 'Installation', hash: '#installation' },
        { title: 'Usage', hash: '#usage' }
      ]
    },
    {
      heading: 'Reference',
      links: [
        { title: 'Types', hash: '#types' },
        { title: 'Options', hash: '#options' },
        { title: 'Multiline', hash: '#multiline' },
        { title: 'Hiding', hash: '#hiding' },
        { title: 'Custom shapes', hash: '#custom-shapes' },
        { title: 'Multiple targets', hash: '#multiple-targets' },
        { title: 'Frameworks', hash: '#frameworks' },
        { title: 'API reference', hash: '#api-reference' },
        { title: 'Browser support', hash: '#browser-support' }
      ]
    }
  ]

  const hashes = nav.flatMap((section) => section.links.map((link) => link.hash))

  let activeHash = $state(hashes[0])
  let activeY = $state<number | null>(null)

  function trackActive(node: HTMLElement) {
    function measure() {
      activeY = node.offsetTop + node.offsetHeight / 2
    }

    measure()

    const container = node.offsetParent ?? node.parentElement
    if (!container) return

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }

  function spy() {
    const onScreen = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const hash = `#${entry.target.id}`
          if (entry.isIntersecting) onScreen.add(hash)
          else onScreen.delete(hash)
        }
        if (onScreen.size === 0) return
        activeHash = hashes.find((hash) => onScreen.has(hash)) ?? activeHash
      },
      { rootMargin: '0px 0px -66% 0px' }
    )

    for (const hash of hashes) {
      const section = document.querySelector(hash)
      if (section) observer.observe(section)
    }

    return () => observer.disconnect()
  }
</script>

<nav class="side-nav" aria-label="On this page" {@attach spy}>
  <div class="side-nav-content">
    {#if activeY !== null}
      <span class="side-nav-indicator" style:--indicator-y="{activeY}px" aria-hidden="true"></span>
    {/if}

    {#each nav as section (section.heading)}
      <div class="side-nav-section">
        <div class="side-nav-heading">{section.heading}</div>
        <ul>
          {#each section.links as link (link.hash)}
            {@const isActive = activeHash === link.hash}
            <li>
              <a
                class="side-nav-link"
                href={link.hash}
                aria-current={isActive ? 'true' : undefined}
                {@attach isActive ? trackActive : undefined}
              >
                {link.title}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</nav>

<style>
  .side-nav {
    --item-height: calc(var(--spacing) * 7);
    --link-padding-x: calc(var(--spacing) * 5);
    --dot-size: calc(var(--spacing) * 2);
    --dot-inset: calc(-1 * var(--spacing) * 2 - var(--dot-size));

    display: none;
    font-size: var(--text-sm);

    @media (width >= 64rem) {
      display: block;
      position: sticky;
      inset-block-start: calc(var(--spacing) * 12);
      align-self: start;
      margin-inline-start: calc(-1 * var(--link-padding-x));
      padding-inline-start: var(--link-padding-x);
    }
  }

  .side-nav-content {
    position: relative;
  }

  .side-nav-indicator,
  .side-nav-link::before {
    position: absolute;
    inline-size: var(--dot-size);
    block-size: var(--dot-size);
    border-radius: var(--radius-full);
    pointer-events: none;
  }

  .side-nav-indicator {
    inset-block-start: 0;
    inset-inline-start: var(--dot-inset);
    background-color: var(--color-foreground);
    opacity: 1;
    transform: translateY(calc(var(--indicator-y) - 50%));
    transition:
      transform 250ms var(--ease-in-out),
      opacity 200ms ease;

    @starting-style {
      opacity: 0;
    }
  }

  .side-nav-section:not(:last-child) {
    margin-block-end: calc(var(--spacing) * 6);
  }

  .side-nav-link {
    display: flex;
    align-items: center;
    min-block-size: var(--item-height);
  }

  .side-nav-heading {
    text-box: trim-both cap alphabetic;
    margin-block-end: calc(var(--spacing) * 2.5);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wider);
    color: var(--color-gray-400);
  }

  .side-nav-link {
    position: relative;
    padding-inline: var(--link-padding-x);
    margin-inline-start: calc(-1 * var(--link-padding-x));
    border-radius: var(--radius-md);
    color: var(--color-gray-700);
    user-select: none;
    transition: color 150ms var(--ease-out);

    &::before {
      content: '';
      inset-block-start: 50%;
      inset-inline-start: calc(var(--link-padding-x) + var(--dot-inset));
      background-color: var(--color-gray-400);
      opacity: 0;
      transform: translateY(-50%);
      transition: opacity 150ms var(--ease-out);
    }

    &:hover {
      color: var(--color-foreground);
    }

    &:hover:not([aria-current='true'])::before {
      opacity: 1;
    }

    &[aria-current='true'] {
      color: var(--color-foreground);
    }

    &:focus-visible {
      z-index: 1;
      outline: var(--focus-ring);
      outline-offset: -1px;
    }
  }
</style>
