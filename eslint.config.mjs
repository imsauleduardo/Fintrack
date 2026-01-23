import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-plugin-prettier/recommended";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Función para limpiar plugins legacy en ESLint 9 y evitar referencias circulares
function fixBlurryPlugins(config) {
  return config.map((conf) => {
    if (conf.plugins) {
      const safePlugins = {};
      for (const [key, plugin] of Object.entries(conf.plugins)) {
        // Para evitar el error de estructura circular, solo pasamos rules y processors
        // y nos aseguramos de no copiar el objeto plugin completo
        safePlugins[key] = {
          rules: plugin.rules || {},
          processors: plugin.processors || {},
        };
      }
      return { ...conf, plugins: safePlugins };
    }
    return conf;
  });
}

const eslintConfig = fixBlurryPlugins([
  // Carga Next.js y TypeScript de forma segura
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Integra Prettier
  prettier,

  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "prettier/prettier": "error",
    },
  },
]);

export default eslintConfig;
