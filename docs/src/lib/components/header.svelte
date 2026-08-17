<script lang="ts">
  import { version } from '@shardsui/notation/package.json'
</script>

<header class="site-header">
  <span class="logo">
    {@render logoIcon()}
  </span>
  <nav class="site-links" aria-label="Site links">
    <span>v{version}</span>
    <div class="site-links-icons">
      <a
        href="https://npmjs.com/package/@shardsui/notation"
        rel="external noopener noreferrer"
        aria-label="npm"
      >
        {@render npmIcon()}
      </a>
      <a href="https://github.com/abdrizik/notation" rel="external noopener noreferrer" aria-label="GitHub">
        {@render githubIcon()}
      </a>
    </div>
  </nav>
</header>

{#snippet logoIcon()}
  <svg viewBox="0 0 24 24" fill="none" role="img" aria-label="notation" width="26" height="26">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C12.5523 20 13 20.4477 13 21C13 21.5523 12.5523 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 15.0376 19.5376 17.5 16.5 17.5C13.4624 17.5 11 15.0376 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 13.933 14.567 15.5 16.5 15.5C18.433 15.5 20 13.933 20 12C20 7.58172 16.4183 4 12 4Z"
      fill="currentColor"
    />
  </svg>
{/snippet}

{#snippet npmIcon()}
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="20" height="20">
    <path d="M3 21H12V7.5H16.5V21H21V3H3V21Z" fill="currentColor" />
  </svg>
{/snippet}

{#snippet githubIcon()}
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="20" height="20">
    <path
      d="M12 1.95068C17.525 1.95068 22 6.42568 22 11.9507C21.9995 14.0459 21.3419 16.0883 20.1198 17.7902C18.8977 19.4922 17.1727 20.768 15.1875 21.4382C14.6875 21.5382 14.5 21.2257 14.5 20.9632C14.5 20.6257 14.5125 19.5507 14.5125 18.2132C14.5125 17.2757 14.2 16.6757 13.8375 16.3632C16.0625 16.1132 18.4 15.2632 18.4 11.4257C18.4 10.3257 18.0125 9.43818 17.375 8.73818C17.475 8.48818 17.825 7.46318 17.275 6.08818C17.275 6.08818 16.4375 5.81318 14.525 7.11318C13.725 6.88818 12.875 6.77568 12.025 6.77568C11.175 6.77568 10.325 6.88818 9.525 7.11318C7.6125 5.82568 6.775 6.08818 6.775 6.08818C6.225 7.46318 6.575 8.48818 6.675 8.73818C6.0375 9.43818 5.65 10.3382 5.65 11.4257C5.65 15.2507 7.975 16.1132 10.2 16.3632C9.9125 16.6132 9.65 17.0507 9.5625 17.7007C8.9875 17.9632 7.55 18.3882 6.65 16.8757C6.4625 16.5757 5.9 15.8382 5.1125 15.8507C4.275 15.8632 4.775 16.3257 5.125 16.5132C5.55 16.7507 6.0375 17.6382 6.15 17.9257C6.35 18.4882 7 19.5632 9.5125 19.1007C9.5125 19.9382 9.525 20.7257 9.525 20.9632C9.525 21.2257 9.3375 21.5257 8.8375 21.4382C6.8458 20.7752 5.11342 19.502 3.88611 17.799C2.65881 16.096 1.9989 14.0498 2 11.9507C2 6.42568 6.475 1.95068 12 1.95068Z"
      fill="currentColor"
    />
  </svg>
{/snippet}

<style>
  .site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block-end: clamp(
      calc(var(--spacing) * 16),
      calc(var(--spacing) * 7) + 3vw,
      calc(var(--spacing) * 22)
    );
  }

  .logo {
    display: flex;
    inline-size: fit-content;
    border-radius: var(--radius-md);
    color: var(--color-logo);
  }

  .site-links {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) * 4);

    > span {
      border-inline-end: var(--border-hairline) solid var(--color-border);
      padding-inline-end: calc(var(--spacing) * 4);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      font-variant-numeric: tabular-nums;
      color: var(--color-gray-700);
    }

    a {
      display: inline-flex;
      border-radius: var(--radius-md);
      padding: calc(var(--spacing) * 1.5);
      color: var(--color-gray-700);
      transition: color 150ms var(--ease-out);
    }

    a:hover {
      color: var(--color-gray-950);
    }
  }

  .site-links-icons {
    display: flex;
    align-items: center;
    margin-inline-end: calc(var(--spacing) * -1.5);
  }

  :is(.logo, .site-links a):focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--spacing);
  }
</style>
