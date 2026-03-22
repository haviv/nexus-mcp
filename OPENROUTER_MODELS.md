# OpenRouter Model Testing Guide

## Quick Start

Your application is now configured to use OpenRouter API with **tool-calling support** (required for MCP). Simply change the `LLM_PROVIDER` in your `.env` file to test different models.

## ⚠️ Important: Tool Support Required

All configured models support **function calling/tool use**, which is essential for MCP database integration. Models without tool support will fail with "No endpoints found that support tool use" error.

## Available OpenRouter Models (All Support Tools)

### OpenAI Models (via OpenRouter)
```bash
LLM_PROVIDER=openrouter-gpt4o          # GPT-4o (latest, best tool support)
LLM_PROVIDER=openrouter-gpt4-turbo     # GPT-4 Turbo
```

### MiniMax Models
```bash
LLM_PROVIDER=openrouter-minimax           # MiniMax M2.1 (supports tool calling)
```

### Qwen Models (Recommended - Best Performance/Price)
```bash
LLM_PROVIDER=openrouter-qwen-72b          # Qwen 2.5 72B Instruct (powerful, cost-effective)
LLM_PROVIDER=openrouter-qwen-coder-32b    # Qwen 2.5 Coder 32B (optimized for code)
```

### DeepSeek Models (Most Cost-Effective)
```bash
LLM_PROVIDER=openrouter-deepseek-chat     # DeepSeek Chat (very cheap, good quality)
```

### Google Gemini Models (Fast & Reliable)
```bash
LLM_PROVIDER=openrouter-gemini-flash      # Gemini Flash 1.5 (fast, efficient)
```

### Anthropic Claude Models (Highest Quality)
```bash
LLM_PROVIDER=openrouter-claude-sonnet     # Claude 3.5 Sonnet (best reasoning)
```

## How to Test Different Models

1. **Edit `.env` file** and change the `LLM_PROVIDER` value
2. **Restart your server** for changes to take effect:
   ```bash
   # If running directly:
   npm run dev
   
   # If running with Docker:
   docker-compose restart backend
   ```
3. **Test the chat** and observe the model's performance

## Model Comparison

| Model | Provider | Tool Support | Best For | Cost |
|-------|----------|--------------|----------|------|
| `openai/gpt-4o` | OpenAI | ✅ Yes | Latest GPT-4, excellent tools | Medium |
| `openai/gpt-4-turbo` | OpenAI | ✅ Yes | Fast GPT-4 variant | Medium |
| `minimax/minimax-01` | MiniMax | ✅ Yes | Tool calling with XML format | Medium |
| `qwen/qwen-2.5-72b-instruct` | Alibaba | ✅ Yes | General tasks, best value | Low |
| `qwen/qwen-2.5-coder-32b-instruct` | Alibaba | ✅ Yes | Code generation | Low |
| `deepseek/deepseek-chat` | DeepSeek | ✅ Yes | Budget-friendly option | Very Low |
| `google/gemini-flash-1.5` | Google | ✅ Yes | Fast responses | Low |
| `anthropic/claude-3.5-sonnet` | Anthropic | ✅ Yes | Complex reasoning | Medium |

## Testing Specific Models via Override

You can use any OpenRouter model with tool support:

```bash
# Set provider and override model:
LLM_PROVIDER=openrouter-qwen-72b
LLM_MODEL=qwen/qwen-2.5-7b-instruct  # Smaller/cheaper variant
```

## Finding More Models with Tool Support

Browse models at: https://openrouter.ai/models

**Filter by "Function Calling" support** to find models compatible with your MCP setup.

## Cost Tracking

OpenRouter provides detailed cost tracking at: https://openrouter.ai/usage

## Troubleshooting

### "No endpoints found that support tool use"
- The model you selected doesn't support function calling
- Switch to one of the pre-configured models above
- All models in this config file support tools

### Other Issues
1. Verify `OPENROUTER_API_KEY` is set correctly in `.env`
2. Check server logs for model availability
3. Ensure your OpenRouter account has credits
4. Verify the exact model ID at https://openrouter.ai/models
