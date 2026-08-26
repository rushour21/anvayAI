export const THEME_KEY = "anvay-theme";

/**
 * Resolves the theme *before first paint*.
 *
 * This has to be a blocking inline script in the document — resolving the
 * theme in an effect would paint the light theme first and then flip, which
 * is the flash every dark mode implementation gets wrong. Kept tiny and
 * wrapped in try/catch because localStorage throws in private-mode Safari.
 */
export default function ThemeScript() {
  const js = `(function(){try{
var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});
if(t!=="light"&&t!=="dark"){t="light";}
document.documentElement.setAttribute("data-theme",t);
}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
