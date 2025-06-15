#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";

interface PubDevPackage {
    name: string;
    latest: {
        version: string;
        pubspec: {
            name: string;
            description: string;
            version: string;
            dependencies?: Record<string, any>;
            dev_dependencies?: Record<string, any>;
            flutter?: any;
        };
        archive_url: string;
        published: string;
    };
    versions: string[];
}

interface PubDevScore {
    grantedPoints: number;
    maxPoints: number;
    likeCount: number;
    popularityScore: number;
    tags: string[];
}

class FlutterPackageMCPServer {
    private server: Server;
    private readonly BASE_URL = "https://pub.dev/api";

    constructor() {
        this.server = new Server(
            {
                name: "flutter-package-server",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "get_package_info",
                    description: "Flutter paketinin güncel bilgilerini getirir (versiyon, açıklama, bağımlılıklar)",
                    inputSchema: {
                        type: "object",
                        properties: {
                            package_name: {
                                type: "string",
                                description: "Flutter paket adı (örn: http, provider, bloc)",
                            },
                        },
                        required: ["package_name"],
                    },
                },
                {
                    name: "search_packages",
                    description: "Flutter paketlerini anahtar kelimeye göre arar",
                    inputSchema: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "Arama terimi",
                            },
                            page: {
                                type: "number",
                                description: "Sayfa numarası (varsayılan: 1)",
                                default: 1,
                            },
                        },
                        required: ["query"],
                    },
                },
                {
                    name: "get_package_versions",
                    description: "Paketin tüm sürümlerini listeler",
                    inputSchema: {
                        type: "object",
                        properties: {
                            package_name: {
                                type: "string",
                                description: "Flutter paket adı",
                            },
                        },
                        required: ["package_name"],
                    },
                },
                {
                    name: "get_package_documentation",
                    description: "Paketin README ve dokümantasyon bilgilerini getirir",
                    inputSchema: {
                        type: "object",
                        properties: {
                            package_name: {
                                type: "string",
                                description: "Flutter paket adı",
                            },
                            version: {
                                type: "string",
                                description: "Paket versiyonu (varsayılan: latest)",
                            },
                        },
                        required: ["package_name"],
                    },
                },
                {
                    name: "get_package_score",
                    description: "Paketin pub.dev puanlarını ve popülerlik skorunu getirir",
                    inputSchema: {
                        type: "object",
                        properties: {
                            package_name: {
                                type: "string",
                                description: "Flutter paket adı",
                            },
                        },
                        required: ["package_name"],
                    },
                },
                {
                    name: "get_trending_packages",
                    description: "Trend olan Flutter paketlerini listeler",
                    inputSchema: {
                        type: "object",
                        properties: {
                            page: {
                                type: "number",
                                description: "Sayfa numarası (varsayılan: 1)",
                                default: 1,
                            },
                        },
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params as { name: string, arguments: any };

            try {
                switch (name) {
                    case "get_package_info":
                        return await this.getPackageInfo(args.package_name);

                    case "search_packages":
                        return await this.searchPackages(args.query, args.page || 1);

                    case "get_package_versions":
                        return await this.getPackageVersions(args.package_name);

                    case "get_package_documentation":
                        return await this.getPackageDocumentation(args.package_name, args.version);

                    case "get_package_score":
                        return await this.getPackageScore(args.package_name);

                    case "get_trending_packages":
                        return await this.getTrendingPackages(args.page || 1);

                    default:
                        throw new McpError(
                            ErrorCode.MethodNotFound,
                            `Bilinmeyen tool: ${name}`
                        );
                }
            } catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }
                throw new McpError(
                    ErrorCode.InternalError,
                    `Tool çalıştırılırken hata: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        });
    }

    private async fetchApi(endpoint: string): Promise<any> {
        const response = await fetch(`${this.BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`API isteği başarısız: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    private async getPackageInfo(packageName: string) {
        const data = await this.fetchApi(`/packages/${packageName}`);

        const packageInfo = {
            name: data.name,
            version: data.latest.version,
            description: data.latest.pubspec.description,
            published: data.latest.published,
            dependencies: data.latest.pubspec.dependencies || {},
            dev_dependencies: data.latest.pubspec.dev_dependencies || {},
            flutter_support: !!data.latest.pubspec.flutter,
            homepage: data.latest.pubspec.homepage,
            repository: data.latest.pubspec.repository,
            documentation: data.latest.pubspec.documentation,
            archive_url: data.latest.archive_url,
            pub_dev_url: `https://pub.dev/packages/${packageName}`,
        };

        return {
            content: [
                {
                    type: "text",
                    text: `# ${packageInfo.name} v${packageInfo.version}

## Açıklama
${packageInfo.description}

## Paket Bilgileri
- **Güncel Versiyon:** ${packageInfo.version}
- **Yayın Tarihi:** ${new Date(packageInfo.published).toLocaleDateString('tr-TR')}
- **Flutter Desteği:** ${packageInfo.flutter_support ? 'Evet' : 'Hayır'}
- **Pub.dev:** ${packageInfo.pub_dev_url}

## Bağımlılıklar
${Object.keys(packageInfo.dependencies).length > 0 ?
                            Object.entries(packageInfo.dependencies)
                                .map(([dep, ver]) => `- ${dep}: ${ver}`)
                                .join('\n') :
                            'Bağımlılık yok'
                        }

## Geliştirme Bağımlılıkları
${Object.keys(packageInfo.dev_dependencies).length > 0 ?
                            Object.entries(packageInfo.dev_dependencies)
                                .map(([dep, ver]) => `- ${dep}: ${ver}`)
                                .join('\n') :
                            'Geliştirme bağımlılığı yok'
                        }

## Kurulum
\`\`\`yaml
dependencies:
  ${packageInfo.name}: ^${packageInfo.version}
\`\`\`

## Import
\`\`\`dart
import 'package:${packageInfo.name}/${packageInfo.name}.dart';
\`\`\`
`,
                },
            ],
        };
    }

    private async searchPackages(query: string, page: number = 1) {
        const data = await this.fetchApi(`/search?q=${encodeURIComponent(query)}&page=${page}`);

        const results = data.packages.map((pkg: any) => ({
            name: pkg.package,
            version: pkg.latest.version,
            description: pkg.latest.pubspec.description,
            score: pkg.score,
        }));

        return {
            content: [
                {
                    type: "text",
                    text: `# Flutter Paket Arama Sonuçları: "${query}"

**Toplam ${data.count} sonuç bulundu (Sayfa ${page})**

${results.map((pkg: any, index: number) => `
## ${index + 1}. ${pkg.name} v${pkg.version}
${pkg.description}
**Skor:** ${Math.round(pkg.score * 100)}%
**Pub.dev:** https://pub.dev/packages/${pkg.name}
`).join('\n')}

${data.next ? `\n*Daha fazla sonuç için sayfa ${page + 1}'i kullanın*` : ''}
`,
                },
            ],
        };
    }

    private async getPackageVersions(packageName: string) {
        const data = await this.fetchApi(`/packages/${packageName}`);
        const versions = data.versions.reverse(); // En yeni versiyonlar önce

        return {
            content: [
                {
                    type: "text",
                    text: `# ${packageName} - Tüm Versiyonlar

**Güncel Versiyon:** ${data.latest.version}

## Versiyon Geçmişi
${versions.map((version: string, index: number) =>
                        `${index + 1}. v${version}${version === data.latest.version ? ' **(güncel)**' : ''}`
                    ).join('\n')}

**Toplam ${versions.length} versiyon mevcut**
`,
                },
            ],
        };
    }

    async getPackageDocumentation(packageName: string, version?: string) {
        try {
            // README içeriğini al
            const versionParam = version ? `/versions/${version}` : '';
            const readmeResponse = await fetch(`https://pub.dev/packages/${packageName}${versionParam}`);
            let readmeContent = 'README bulunamadı';

            if (readmeResponse.ok) {
                const readmeHtml = await readmeResponse.text();
                // HTML'den metin içeriğini çıkar (basit parse)
                readmeContent = readmeHtml
                    .replace(/<[^>]*>/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .trim();
            }
            console.log(JSON.stringify(readmeResponse), readmeContent);
            // Paket bilgilerini de al
            const packageData = await this.fetchApi(`/packages/${packageName}`);

            return {
                content: [
                    {
                        type: "text",
                        text: `# ${packageName} Dokümantasyonu

## Paket Bilgileri
- **Versiyon:** ${version || packageData.latest.version}
- **Açıklama:** ${packageData.latest.pubspec.description}
- **Pub.dev:** https://pub.dev/packages/${packageName}
- **Dokümantasyon:** https://pub.dev/packages/${packageName}/doc

## README
${readmeContent.length > 2000 ? readmeContent.substring(0, 2000) + '\n\n...(devamı için pub.dev linkini ziyaret edin)' : readmeContent}

## Faydalı Linkler
- [Pub.dev Sayfası](https://pub.dev/packages/${packageName})
- [API Dokümantasyonu](https://pub.dev/documentation/${packageName}/latest/)
- [Örnek Kullanım](https://pub.dev/packages/${packageName}/example)
${packageData.latest.pubspec.repository ? `- [Kaynak Kodu](${packageData.latest.pubspec.repository})` : ''}
`,
                    },
                ],
            };
        } catch (error) {
            throw new Error(`Dokümantasyon alınırken hata: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async getPackageScore(packageName: string) {
        const data = await this.fetchApi(`/packages/${packageName}/score`);

        return {
            content: [
                {
                    type: "text",
                    text: `# ${packageName} - Paket Skorları

## Genel Skor
**${data.grantedPoints}/${data.maxPoints} puan** (${Math.round((data.grantedPoints / data.maxPoints) * 100)}%)

## Detaylı Puanlama
- **Beğeni Sayısı:** ${data.likeCount} ❤️
- **Popülerlik Skoru:** ${Math.round(data.popularityScore * 100)}%

## Etiketler
${data.tags && data.tags.length > 0 ?
                            data.tags.map((tag: string) => `- ${tag}`).join('\n') :
                            'Etiket yok'
                        }

## Pub.dev Sayfası
https://pub.dev/packages/${packageName}
`,
                },
            ],
        };
    }

    private async getTrendingPackages(page: number = 1) {
        // Popüler paketleri getir (most liked sıralama)
        const data = await this.fetchApi(`/search?sort=popularity&page=${page}`);

        const packages = data.packages.slice(0, 10).map((pkg: any, index: number) => ({
            rank: (page - 1) * 10 + index + 1,
            name: pkg.package,
            version: pkg.latest.version,
            description: pkg.latest.pubspec.description,
            score: pkg.score,
        }));

        return {
            content: [
                {
                    type: "text",
                    text: `# Trend Flutter Paketleri (Sayfa ${page})

${packages.map((pkg: any) => `
## ${pkg.rank}. ${pkg.name} v${pkg.version}
${pkg.description}
**Skor:** ${Math.round(pkg.score * 100)}%
**Link:** https://pub.dev/packages/${pkg.name}
`).join('\n')}

*Daha fazla için sayfa ${page + 1}'i kullanın*
`,
                },
            ],
        };
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Flutter Package MCP Server başlatıldı");
    }
}

const server = new FlutterPackageMCPServer();
server.run().then(() => {
    server.getPackageDocumentation("provider", "6.1.5");
}).catch(console.error);
