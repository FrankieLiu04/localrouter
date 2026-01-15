## DeepSeek API 官方文档

**官方文档地址：**

* 中文：[https://api-docs.deepseek.com/zh-cn/](https://api-docs.deepseek.com/zh-cn/)
* 英文：[https://api-docs.deepseek.com](https://api-docs.deepseek.com/)

DeepSeek API 采用与 OpenAI 兼容的接口格式，可以直接使用 OpenAI SDK 调用。[[api-docs.deepseek](https://api-docs.deepseek.com/zh-cn/)]

## 核心接口说明

## 1. 鉴权方式

**API 端点基础地址：** `https://api.deepseek.com`[[api-docs.deepseek](https://api-docs.deepseek.com/)]

**鉴权方法：** Bearer Token

* 在请求头中添加：`Authorization: Bearer {YOUR_API_KEY}`[[blog.csdn](https://blog.csdn.net/qq_38027465/article/details/145519538)]
* API Key 需在官网申请：[https://platform.deepseek.com](https://platform.deepseek.com/)[[blog.csdn](https://blog.csdn.net/skywalk8163/article/details/145615963)]

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="复制代码" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">bash</div></div><div><span><code><span><span class="token token"># Header 示例</span><span>
</span></span><span><span>Authorization: Bearer </span><span class="token token operator"><</span><span>DEEPSEEK_API_KEY</span><span class="token token operator">></span><span>
</span></span><span>Content-Type: application/json
</span><span></span></code></span></div></div></div></pre>

## 2. Chat Completions 接口

**接口路径：** `POST https://api.deepseek.com/chat/completions`[[api-docs.deepseek](https://api-docs.deepseek.com/)]

**请求参数示例：**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="复制代码" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">json</div></div><div><span><code><span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token property">"model"</span><span class="token token operator">:</span><span></span><span class="token token">"deepseek-chat"</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"messages"</span><span class="token token operator">:</span><span></span><span class="token token punctuation">[</span><span>
</span></span><span><span></span><span class="token token punctuation">{</span><span class="token token property">"role"</span><span class="token token operator">:</span><span></span><span class="token token">"system"</span><span class="token token punctuation">,</span><span></span><span class="token token property">"content"</span><span class="token token operator">:</span><span></span><span class="token token">"You are a helpful assistant."</span><span class="token token punctuation">}</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token punctuation">{</span><span class="token token property">"role"</span><span class="token token operator">:</span><span></span><span class="token token">"user"</span><span class="token token punctuation">,</span><span></span><span class="token token property">"content"</span><span class="token token operator">:</span><span></span><span class="token token">"Hello!"</span><span class="token token punctuation">}</span><span>
</span></span><span><span></span><span class="token token punctuation">]</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"stream"</span><span class="token token operator">:</span><span></span><span class="token token boolean">false</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"temperature"</span><span class="token token operator">:</span><span></span><span class="token token">1</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"max_tokens"</span><span class="token token operator">:</span><span></span><span class="token token">2048</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span>
</span></span><span></span></code></span></div></div></div></pre>

**响应格式：**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="复制代码" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">json</div></div><div><span><code><span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token property">"id"</span><span class="token token operator">:</span><span></span><span class="token token">"request_id"</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"object"</span><span class="token token operator">:</span><span></span><span class="token token">"chat.completion"</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"created"</span><span class="token token operator">:</span><span></span><span class="token token">1234567890</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"model"</span><span class="token token operator">:</span><span></span><span class="token token">"deepseek-chat"</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"choices"</span><span class="token token operator">:</span><span></span><span class="token token punctuation">[</span><span>
</span></span><span><span></span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token property">"index"</span><span class="token token operator">:</span><span></span><span class="token token">0</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"message"</span><span class="token token operator">:</span><span></span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token property">"role"</span><span class="token token operator">:</span><span></span><span class="token token">"assistant"</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"content"</span><span class="token token operator">:</span><span></span><span class="token token">"响应内容"</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"finish_reason"</span><span class="token token operator">:</span><span></span><span class="token token">"stop"</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span>
</span></span><span><span></span><span class="token token punctuation">]</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"usage"</span><span class="token token operator">:</span><span></span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token property">"prompt_tokens"</span><span class="token token operator">:</span><span></span><span class="token token">10</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"completion_tokens"</span><span class="token token operator">:</span><span></span><span class="token token">20</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"total_tokens"</span><span class="token token operator">:</span><span></span><span class="token token">30</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span>
</span></span><span></span></code></span></div></div></div></pre>

 **finish_reason 可能值：** [[deepseek-api](http://deepseek-api.ru/docs/chat/create-chat-completion/)]

* `stop` - 正常完成
* `length` - 达到最大 token 数
* `content_filter` - 内容过滤
* `tool_calls` - 调用了工具
* `insufficient_system_resource` - 系统资源不足

## 3. 流式 SSE 格式

**开启流式：** 设置 `"stream": true`[[api-docs.deepseek](https://api-docs.deepseek.com/)]

 **SSE 数据格式：** [[dev](https://dev.to/apilover/how-to-stream-deepseek-api-responses-using-server-sent-events-sse-2inb)]

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="复制代码" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>data: {"id":"xxx","choices":[{"delta":{"content":"H"},"index":0}]}
</span></span><span>
</span><span>data: {"id":"xxx","choices":[{"delta":{"content":"i"},"index":0}]}
</span><span>
</span><span>data: [DONE]
</span><span></span></code></span></div></div></div></pre>

每个数据块以 `data:` 前缀开始，使用双换行符 `\n\n` 分隔。流式结束时返回 `data: [DONE]`。[[blog.csdn](https://blog.csdn.net/weixin_55010563/article/details/146331126)]

**Python 流式调用示例：**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="复制代码" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">python</div></div><div><span><code><span><span class="token token">from</span><span> openai </span><span class="token token">import</span><span> OpenAI
</span></span><span>
</span><span><span>client </span><span class="token token operator">=</span><span> OpenAI</span><span class="token token punctuation">(</span><span>
</span></span><span><span>    api_key</span><span class="token token operator">=</span><span class="token token">"YOUR_API_KEY"</span><span class="token token punctuation">,</span><span>
</span></span><span><span>    base_url</span><span class="token token operator">=</span><span class="token token">"https://api.deepseek.com"</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span>
</span></span><span>
</span><span><span>response </span><span class="token token operator">=</span><span> client</span><span class="token token punctuation">.</span><span>chat</span><span class="token token punctuation">.</span><span>completions</span><span class="token token punctuation">.</span><span>create</span><span class="token token punctuation">(</span><span>
</span></span><span><span>    model</span><span class="token token operator">=</span><span class="token token">"deepseek-chat"</span><span class="token token punctuation">,</span><span>
</span></span><span><span>    messages</span><span class="token token operator">=</span><span class="token token punctuation">[</span><span class="token token punctuation">{</span><span class="token token">"role"</span><span class="token token punctuation">:</span><span></span><span class="token token">"user"</span><span class="token token punctuation">,</span><span></span><span class="token token">"content"</span><span class="token token punctuation">:</span><span></span><span class="token token">"Hello"</span><span class="token token punctuation">}</span><span class="token token punctuation">]</span><span class="token token punctuation">,</span><span>
</span></span><span><span>    stream</span><span class="token token operator">=</span><span class="token token boolean">True</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span>
</span></span><span>
</span><span><span></span><span class="token token">for</span><span> chunk </span><span class="token token">in</span><span> response</span><span class="token token punctuation">:</span><span>
</span></span><span><span></span><span class="token token">if</span><span> chunk</span><span class="token token punctuation">.</span><span>choices</span><span class="token token punctuation">[</span><span class="token token">0</span><span class="token token punctuation">]</span><span class="token token punctuation">.</span><span>delta</span><span class="token token punctuation">.</span><span>content</span><span class="token token punctuation">:</span><span>
</span></span><span><span></span><span class="token token">print</span><span class="token token punctuation">(</span><span>chunk</span><span class="token token punctuation">.</span><span>choices</span><span class="token token punctuation">[</span><span class="token token">0</span><span class="token token punctuation">]</span><span class="token token punctuation">.</span><span>delta</span><span class="token token punctuation">.</span><span>content</span><span class="token token punctuation">,</span><span> end</span><span class="token token operator">=</span><span class="token token">""</span><span class="token token punctuation">)</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## 4. 模型列表接口

**接口路径：** `GET https://api.deepseek.com/models`[[api-docs.deepseek](https://api-docs.deepseek.com/api/list-models)]

**响应示例：**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="复制代码" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">json</div></div><div><span><code><span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token property">"object"</span><span class="token token operator">:</span><span></span><span class="token token">"list"</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"data"</span><span class="token token operator">:</span><span></span><span class="token token punctuation">[</span><span>
</span></span><span><span></span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token property">"id"</span><span class="token token operator">:</span><span></span><span class="token token">"deepseek-chat"</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"object"</span><span class="token token operator">:</span><span></span><span class="token token">"model"</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"owned_by"</span><span class="token token operator">:</span><span></span><span class="token token">"deepseek"</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token property">"id"</span><span class="token token operator">:</span><span></span><span class="token token">"deepseek-reasoner"</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"object"</span><span class="token token operator">:</span><span></span><span class="token token">"model"</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"owned_by"</span><span class="token token operator">:</span><span></span><span class="token token">"deepseek"</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span>
</span></span><span><span></span><span class="token token punctuation">]</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span>
</span></span><span></span></code></span></div></div></div></pre>

 **当前可用模型：** [[api-docs.deepseek](https://api-docs.deepseek.com/)]

* `deepseek-chat` - DeepSeek-V3.2 非思考模式
* `deepseek-reasoner` - DeepSeek-V3.2 思考模式（带推理过程）

## 5. 错误格式

 **HTTP 状态码：** [[geeksforgeeks](https://www.geeksforgeeks.org/websites-apps/how-to-fix-deepseek-400-error/)]

* `400` - 请求格式错误（Invalid Format）
* `401` - 鉴权失败
* `422` - 参数验证失败[[github](https://github.com/langgenius/dify/issues/11677)]
* `429` - 请求频率超限
* `500` - 服务器内部错误

**错误响应示例：**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="复制代码" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">json</div></div><div><span><code><span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token property">"error"</span><span class="token token operator">:</span><span></span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token property">"message"</span><span class="token token operator">:</span><span></span><span class="token token">"API request failed with status code 422: Failed to deserialize..."</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"type"</span><span class="token token operator">:</span><span></span><span class="token token">"invalid_request_error"</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token property">"code"</span><span class="token token operator">:</span><span></span><span class="token token">"invalid_format"</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span>
</span></span><span></span></code></span></div></div></div></pre>

 **常见错误原因：** [[geeksforgeeks](https://www.geeksforgeeks.org/websites-apps/how-to-fix-deepseek-400-error/)]

* JSON 格式错误（缺少引号、逗号等）
* 缺少必需字段
* 数据类型不匹配
* Content-Type 头设置错误

## 快速开始代码

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="复制代码" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">python</div></div><div><span><code><span><span class="token token"># 安装依赖: pip install openai</span><span>
</span></span><span><span></span><span class="token token">import</span><span> os
</span></span><span><span></span><span class="token token">from</span><span> openai </span><span class="token token">import</span><span> OpenAI
</span></span><span>
</span><span><span>client </span><span class="token token operator">=</span><span> OpenAI</span><span class="token token punctuation">(</span><span>
</span></span><span><span>    api_key</span><span class="token token operator">=</span><span>os</span><span class="token token punctuation">.</span><span>environ</span><span class="token token punctuation">.</span><span>get</span><span class="token token punctuation">(</span><span class="token token">'DEEPSEEK_API_KEY'</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>    base_url</span><span class="token token operator">=</span><span class="token token">"https://api.deepseek.com"</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span>
</span></span><span>
</span><span><span>response </span><span class="token token operator">=</span><span> client</span><span class="token token punctuation">.</span><span>chat</span><span class="token token punctuation">.</span><span>completions</span><span class="token token punctuation">.</span><span>create</span><span class="token token punctuation">(</span><span>
</span></span><span><span>    model</span><span class="token token operator">=</span><span class="token token">"deepseek-chat"</span><span class="token token punctuation">,</span><span>
</span></span><span><span>    messages</span><span class="token token operator">=</span><span class="token token punctuation">[</span><span>
</span></span><span><span></span><span class="token token punctuation">{</span><span class="token token">"role"</span><span class="token token punctuation">:</span><span></span><span class="token token">"system"</span><span class="token token punctuation">,</span><span></span><span class="token token">"content"</span><span class="token token punctuation">:</span><span></span><span class="token token">"You are a helpful assistant"</span><span class="token token punctuation">}</span><span class="token token punctuation">,</span><span>
</span></span><span><span></span><span class="token token punctuation">{</span><span class="token token">"role"</span><span class="token token punctuation">:</span><span></span><span class="token token">"user"</span><span class="token token punctuation">,</span><span></span><span class="token token">"content"</span><span class="token token punctuation">:</span><span></span><span class="token token">"Hello"</span><span class="token token punctuation">}</span><span>
</span></span><span><span></span><span class="token token punctuation">]</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span>
</span></span><span>
</span><span><span></span><span class="token token">print</span><span class="token token punctuation">(</span><span>response</span><span class="token token punctuation">.</span><span>choices</span><span class="token token punctuation">[</span><span class="token token">0</span><span class="token token punctuation">]</span><span class="token token punctuation">.</span><span>message</span><span class="token token punctuation">.</span><span>content</span><span class="token token punctuation">)</span><span>
</span></span><span></span></code></span></div></div></div></pre>
