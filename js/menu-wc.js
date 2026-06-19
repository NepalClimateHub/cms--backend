'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">nch-backend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AiAssistantModule.html" data-type="entity-link" >AiAssistantModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AiAssistantModule-34b42d2f8825b6f10458132bcfc963f84e1a1ea9995b81e576805003e7dac55294d4027aafe58ea35eeb7c0455fe688790db2ef4a0b032875bd6b3d258df100d"' : 'data-bs-target="#xs-controllers-links-module-AiAssistantModule-34b42d2f8825b6f10458132bcfc963f84e1a1ea9995b81e576805003e7dac55294d4027aafe58ea35eeb7c0455fe688790db2ef4a0b032875bd6b3d258df100d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AiAssistantModule-34b42d2f8825b6f10458132bcfc963f84e1a1ea9995b81e576805003e7dac55294d4027aafe58ea35eeb7c0455fe688790db2ef4a0b032875bd6b3d258df100d"' :
                                            'id="xs-controllers-links-module-AiAssistantModule-34b42d2f8825b6f10458132bcfc963f84e1a1ea9995b81e576805003e7dac55294d4027aafe58ea35eeb7c0455fe688790db2ef4a0b032875bd6b3d258df100d"' }>
                                            <li class="link">
                                                <a href="controllers/AiAssistantController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AiAssistantController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AiAssistantModule-34b42d2f8825b6f10458132bcfc963f84e1a1ea9995b81e576805003e7dac55294d4027aafe58ea35eeb7c0455fe688790db2ef4a0b032875bd6b3d258df100d"' : 'data-bs-target="#xs-injectables-links-module-AiAssistantModule-34b42d2f8825b6f10458132bcfc963f84e1a1ea9995b81e576805003e7dac55294d4027aafe58ea35eeb7c0455fe688790db2ef4a0b032875bd6b3d258df100d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AiAssistantModule-34b42d2f8825b6f10458132bcfc963f84e1a1ea9995b81e576805003e7dac55294d4027aafe58ea35eeb7c0455fe688790db2ef4a0b032875bd6b3d258df100d"' :
                                        'id="xs-injectables-links-module-AiAssistantModule-34b42d2f8825b6f10458132bcfc963f84e1a1ea9995b81e576805003e7dac55294d4027aafe58ea35eeb7c0455fe688790db2ef4a0b032875bd6b3d258df100d"' }>
                                        <li class="link">
                                            <a href="injectables/AiAssistantService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AiAssistantService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AnalyticsModule.html" data-type="entity-link" >AnalyticsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AnalyticsModule-460d3cde333f39868c5f199607784ef36a09e919ce927ff33fc09323e680ca8d436e994a22f45535efa27244675c8a88e043ca68888d0c6a8b618b5e2e8021b3"' : 'data-bs-target="#xs-controllers-links-module-AnalyticsModule-460d3cde333f39868c5f199607784ef36a09e919ce927ff33fc09323e680ca8d436e994a22f45535efa27244675c8a88e043ca68888d0c6a8b618b5e2e8021b3"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AnalyticsModule-460d3cde333f39868c5f199607784ef36a09e919ce927ff33fc09323e680ca8d436e994a22f45535efa27244675c8a88e043ca68888d0c6a8b618b5e2e8021b3"' :
                                            'id="xs-controllers-links-module-AnalyticsModule-460d3cde333f39868c5f199607784ef36a09e919ce927ff33fc09323e680ca8d436e994a22f45535efa27244675c8a88e043ca68888d0c6a8b618b5e2e8021b3"' }>
                                            <li class="link">
                                                <a href="controllers/AnalyticsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnalyticsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AnalyticsModule-460d3cde333f39868c5f199607784ef36a09e919ce927ff33fc09323e680ca8d436e994a22f45535efa27244675c8a88e043ca68888d0c6a8b618b5e2e8021b3"' : 'data-bs-target="#xs-injectables-links-module-AnalyticsModule-460d3cde333f39868c5f199607784ef36a09e919ce927ff33fc09323e680ca8d436e994a22f45535efa27244675c8a88e043ca68888d0c6a8b618b5e2e8021b3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AnalyticsModule-460d3cde333f39868c5f199607784ef36a09e919ce927ff33fc09323e680ca8d436e994a22f45535efa27244675c8a88e043ca68888d0c6a8b618b5e2e8021b3"' :
                                        'id="xs-injectables-links-module-AnalyticsModule-460d3cde333f39868c5f199607784ef36a09e919ce927ff33fc09323e680ca8d436e994a22f45535efa27244675c8a88e043ca68888d0c6a8b618b5e2e8021b3"' }>
                                        <li class="link">
                                            <a href="injectables/AnalyticsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnalyticsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppLoggerModule.html" data-type="entity-link" >AppLoggerModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppLoggerModule-fdb7ed66271f53268b2a51c691c5ef7c11cfa001cdd3bded3ce574adaf3b6f66f76071898c02d30d092942cb186887845cd790c11b54253dade9d471421de582"' : 'data-bs-target="#xs-injectables-links-module-AppLoggerModule-fdb7ed66271f53268b2a51c691c5ef7c11cfa001cdd3bded3ce574adaf3b6f66f76071898c02d30d092942cb186887845cd790c11b54253dade9d471421de582"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppLoggerModule-fdb7ed66271f53268b2a51c691c5ef7c11cfa001cdd3bded3ce574adaf3b6f66f76071898c02d30d092942cb186887845cd790c11b54253dade9d471421de582"' :
                                        'id="xs-injectables-links-module-AppLoggerModule-fdb7ed66271f53268b2a51c691c5ef7c11cfa001cdd3bded3ce574adaf3b6f66f76071898c02d30d092942cb186887845cd790c11b54253dade9d471421de582"' }>
                                        <li class="link">
                                            <a href="injectables/AppLogger.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppLogger</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-db11cae1c3a0330db266401569de53d044096d724baf3f24833d5c567dbde470cd0cadf1dfb02859947e6b0dfef10be9717dced28f2a4dff228dfed0218bb56f"' : 'data-bs-target="#xs-controllers-links-module-AppModule-db11cae1c3a0330db266401569de53d044096d724baf3f24833d5c567dbde470cd0cadf1dfb02859947e6b0dfef10be9717dced28f2a4dff228dfed0218bb56f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-db11cae1c3a0330db266401569de53d044096d724baf3f24833d5c567dbde470cd0cadf1dfb02859947e6b0dfef10be9717dced28f2a4dff228dfed0218bb56f"' :
                                            'id="xs-controllers-links-module-AppModule-db11cae1c3a0330db266401569de53d044096d724baf3f24833d5c567dbde470cd0cadf1dfb02859947e6b0dfef10be9717dced28f2a4dff228dfed0218bb56f"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-db11cae1c3a0330db266401569de53d044096d724baf3f24833d5c567dbde470cd0cadf1dfb02859947e6b0dfef10be9717dced28f2a4dff228dfed0218bb56f"' : 'data-bs-target="#xs-injectables-links-module-AppModule-db11cae1c3a0330db266401569de53d044096d724baf3f24833d5c567dbde470cd0cadf1dfb02859947e6b0dfef10be9717dced28f2a4dff228dfed0218bb56f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-db11cae1c3a0330db266401569de53d044096d724baf3f24833d5c567dbde470cd0cadf1dfb02859947e6b0dfef10be9717dced28f2a4dff228dfed0218bb56f"' :
                                        'id="xs-injectables-links-module-AppModule-db11cae1c3a0330db266401569de53d044096d724baf3f24833d5c567dbde470cd0cadf1dfb02859947e6b0dfef10be9717dced28f2a4dff228dfed0218bb56f"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-8deb36274e4b0953fbf683fc19e6ef4ba07035d4dc8f15a6a7f7f9c002cd064ed61b3ae75dbe15574afe689b8373b7f01f608f3ab21402d05fc76db2b9b7b5bb"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-8deb36274e4b0953fbf683fc19e6ef4ba07035d4dc8f15a6a7f7f9c002cd064ed61b3ae75dbe15574afe689b8373b7f01f608f3ab21402d05fc76db2b9b7b5bb"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-8deb36274e4b0953fbf683fc19e6ef4ba07035d4dc8f15a6a7f7f9c002cd064ed61b3ae75dbe15574afe689b8373b7f01f608f3ab21402d05fc76db2b9b7b5bb"' :
                                            'id="xs-controllers-links-module-AuthModule-8deb36274e4b0953fbf683fc19e6ef4ba07035d4dc8f15a6a7f7f9c002cd064ed61b3ae75dbe15574afe689b8373b7f01f608f3ab21402d05fc76db2b9b7b5bb"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-8deb36274e4b0953fbf683fc19e6ef4ba07035d4dc8f15a6a7f7f9c002cd064ed61b3ae75dbe15574afe689b8373b7f01f608f3ab21402d05fc76db2b9b7b5bb"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-8deb36274e4b0953fbf683fc19e6ef4ba07035d4dc8f15a6a7f7f9c002cd064ed61b3ae75dbe15574afe689b8373b7f01f608f3ab21402d05fc76db2b9b7b5bb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-8deb36274e4b0953fbf683fc19e6ef4ba07035d4dc8f15a6a7f7f9c002cd064ed61b3ae75dbe15574afe689b8373b7f01f608f3ab21402d05fc76db2b9b7b5bb"' :
                                        'id="xs-injectables-links-module-AuthModule-8deb36274e4b0953fbf683fc19e6ef4ba07035d4dc8f15a6a7f7f9c002cd064ed61b3ae75dbe15574afe689b8373b7f01f608f3ab21402d05fc76db2b9b7b5bb"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtAuthStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtAuthStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtRefreshStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtRefreshStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LocalStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LocalStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/BlogModule.html" data-type="entity-link" >BlogModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-BlogModule-dbd8d9bac5412b9856f89f38f8905e8321d8ddd1a6363bde3d4acbe6d571d02eed4bbc2596ce0024cd03629f64dc383faf21f770ddea3e9186271bb30c4d8330"' : 'data-bs-target="#xs-controllers-links-module-BlogModule-dbd8d9bac5412b9856f89f38f8905e8321d8ddd1a6363bde3d4acbe6d571d02eed4bbc2596ce0024cd03629f64dc383faf21f770ddea3e9186271bb30c4d8330"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-BlogModule-dbd8d9bac5412b9856f89f38f8905e8321d8ddd1a6363bde3d4acbe6d571d02eed4bbc2596ce0024cd03629f64dc383faf21f770ddea3e9186271bb30c4d8330"' :
                                            'id="xs-controllers-links-module-BlogModule-dbd8d9bac5412b9856f89f38f8905e8321d8ddd1a6363bde3d4acbe6d571d02eed4bbc2596ce0024cd03629f64dc383faf21f770ddea3e9186271bb30c4d8330"' }>
                                            <li class="link">
                                                <a href="controllers/BlogController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BlogController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-BlogModule-dbd8d9bac5412b9856f89f38f8905e8321d8ddd1a6363bde3d4acbe6d571d02eed4bbc2596ce0024cd03629f64dc383faf21f770ddea3e9186271bb30c4d8330"' : 'data-bs-target="#xs-injectables-links-module-BlogModule-dbd8d9bac5412b9856f89f38f8905e8321d8ddd1a6363bde3d4acbe6d571d02eed4bbc2596ce0024cd03629f64dc383faf21f770ddea3e9186271bb30c4d8330"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-BlogModule-dbd8d9bac5412b9856f89f38f8905e8321d8ddd1a6363bde3d4acbe6d571d02eed4bbc2596ce0024cd03629f64dc383faf21f770ddea3e9186271bb30c4d8330"' :
                                        'id="xs-injectables-links-module-BlogModule-dbd8d9bac5412b9856f89f38f8905e8321d8ddd1a6363bde3d4acbe6d571d02eed4bbc2596ce0024cd03629f64dc383faf21f770ddea3e9186271bb30c4d8330"' }>
                                        <li class="link">
                                            <a href="injectables/BlogService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BlogService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CategoryModule.html" data-type="entity-link" >CategoryModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CategoryModule-585651433bf7b90eee40fd650b30938e3924a9b23aa7f5ef2c338aa1058a16a04a6b28883a436aff9960ac7cf5422237f058606b8e6177b914da5244e497d2e2"' : 'data-bs-target="#xs-controllers-links-module-CategoryModule-585651433bf7b90eee40fd650b30938e3924a9b23aa7f5ef2c338aa1058a16a04a6b28883a436aff9960ac7cf5422237f058606b8e6177b914da5244e497d2e2"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CategoryModule-585651433bf7b90eee40fd650b30938e3924a9b23aa7f5ef2c338aa1058a16a04a6b28883a436aff9960ac7cf5422237f058606b8e6177b914da5244e497d2e2"' :
                                            'id="xs-controllers-links-module-CategoryModule-585651433bf7b90eee40fd650b30938e3924a9b23aa7f5ef2c338aa1058a16a04a6b28883a436aff9960ac7cf5422237f058606b8e6177b914da5244e497d2e2"' }>
                                            <li class="link">
                                                <a href="controllers/CategoryController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoryController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CategoryModule-585651433bf7b90eee40fd650b30938e3924a9b23aa7f5ef2c338aa1058a16a04a6b28883a436aff9960ac7cf5422237f058606b8e6177b914da5244e497d2e2"' : 'data-bs-target="#xs-injectables-links-module-CategoryModule-585651433bf7b90eee40fd650b30938e3924a9b23aa7f5ef2c338aa1058a16a04a6b28883a436aff9960ac7cf5422237f058606b8e6177b914da5244e497d2e2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CategoryModule-585651433bf7b90eee40fd650b30938e3924a9b23aa7f5ef2c338aa1058a16a04a6b28883a436aff9960ac7cf5422237f058606b8e6177b914da5244e497d2e2"' :
                                        'id="xs-injectables-links-module-CategoryModule-585651433bf7b90eee40fd650b30938e3924a9b23aa7f5ef2c338aa1058a16a04a6b28883a436aff9960ac7cf5422237f058606b8e6177b914da5244e497d2e2"' }>
                                        <li class="link">
                                            <a href="injectables/CategoryService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoryService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ClimateChampionModule.html" data-type="entity-link" >ClimateChampionModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ClimateChampionModule-dbb886b06b906d93bad98a32238befaf0de0590162330a7a413437c0dc399b35c399b0ac2c6eaea93b7d29cae3144cedb0e0b8e6eac86eff923b317f39370247"' : 'data-bs-target="#xs-controllers-links-module-ClimateChampionModule-dbb886b06b906d93bad98a32238befaf0de0590162330a7a413437c0dc399b35c399b0ac2c6eaea93b7d29cae3144cedb0e0b8e6eac86eff923b317f39370247"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ClimateChampionModule-dbb886b06b906d93bad98a32238befaf0de0590162330a7a413437c0dc399b35c399b0ac2c6eaea93b7d29cae3144cedb0e0b8e6eac86eff923b317f39370247"' :
                                            'id="xs-controllers-links-module-ClimateChampionModule-dbb886b06b906d93bad98a32238befaf0de0590162330a7a413437c0dc399b35c399b0ac2c6eaea93b7d29cae3144cedb0e0b8e6eac86eff923b317f39370247"' }>
                                            <li class="link">
                                                <a href="controllers/ClimateChampionController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClimateChampionController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ClimateChampionModule-dbb886b06b906d93bad98a32238befaf0de0590162330a7a413437c0dc399b35c399b0ac2c6eaea93b7d29cae3144cedb0e0b8e6eac86eff923b317f39370247"' : 'data-bs-target="#xs-injectables-links-module-ClimateChampionModule-dbb886b06b906d93bad98a32238befaf0de0590162330a7a413437c0dc399b35c399b0ac2c6eaea93b7d29cae3144cedb0e0b8e6eac86eff923b317f39370247"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ClimateChampionModule-dbb886b06b906d93bad98a32238befaf0de0590162330a7a413437c0dc399b35c399b0ac2c6eaea93b7d29cae3144cedb0e0b8e6eac86eff923b317f39370247"' :
                                        'id="xs-injectables-links-module-ClimateChampionModule-dbb886b06b906d93bad98a32238befaf0de0590162330a7a413437c0dc399b35c399b0ac2c6eaea93b7d29cae3144cedb0e0b8e6eac86eff923b317f39370247"' }>
                                        <li class="link">
                                            <a href="injectables/ClimateChampionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClimateChampionService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DatabaseModule.html" data-type="entity-link" >DatabaseModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-DatabaseModule-fa14a6a0e4d2080757bd98b9361b2c4c49b9a6039bcb083ab872640f2dc7d22ab425873f66e84e083ed9bd3e69539231362e9a19fcf0f07d33306707aa036104"' : 'data-bs-target="#xs-controllers-links-module-DatabaseModule-fa14a6a0e4d2080757bd98b9361b2c4c49b9a6039bcb083ab872640f2dc7d22ab425873f66e84e083ed9bd3e69539231362e9a19fcf0f07d33306707aa036104"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-DatabaseModule-fa14a6a0e4d2080757bd98b9361b2c4c49b9a6039bcb083ab872640f2dc7d22ab425873f66e84e083ed9bd3e69539231362e9a19fcf0f07d33306707aa036104"' :
                                            'id="xs-controllers-links-module-DatabaseModule-fa14a6a0e4d2080757bd98b9361b2c4c49b9a6039bcb083ab872640f2dc7d22ab425873f66e84e083ed9bd3e69539231362e9a19fcf0f07d33306707aa036104"' }>
                                            <li class="link">
                                                <a href="controllers/DatabaseController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DatabaseController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DatabaseModule-fa14a6a0e4d2080757bd98b9361b2c4c49b9a6039bcb083ab872640f2dc7d22ab425873f66e84e083ed9bd3e69539231362e9a19fcf0f07d33306707aa036104"' : 'data-bs-target="#xs-injectables-links-module-DatabaseModule-fa14a6a0e4d2080757bd98b9361b2c4c49b9a6039bcb083ab872640f2dc7d22ab425873f66e84e083ed9bd3e69539231362e9a19fcf0f07d33306707aa036104"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DatabaseModule-fa14a6a0e4d2080757bd98b9361b2c4c49b9a6039bcb083ab872640f2dc7d22ab425873f66e84e083ed9bd3e69539231362e9a19fcf0f07d33306707aa036104"' :
                                        'id="xs-injectables-links-module-DatabaseModule-fa14a6a0e4d2080757bd98b9361b2c4c49b9a6039bcb083ab872640f2dc7d22ab425873f66e84e083ed9bd3e69539231362e9a19fcf0f07d33306707aa036104"' }>
                                        <li class="link">
                                            <a href="injectables/DatabaseService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DatabaseService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EmailSubscriptionModule.html" data-type="entity-link" >EmailSubscriptionModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-EmailSubscriptionModule-942ac917bbe7f284e95600c81713985baa3ea568eee91b68fea34ca6b2f3fc41f7e672394eddcbb390e611c646b3f1a4349ce3ac541f636f55b4f1ba9222da6d"' : 'data-bs-target="#xs-controllers-links-module-EmailSubscriptionModule-942ac917bbe7f284e95600c81713985baa3ea568eee91b68fea34ca6b2f3fc41f7e672394eddcbb390e611c646b3f1a4349ce3ac541f636f55b4f1ba9222da6d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-EmailSubscriptionModule-942ac917bbe7f284e95600c81713985baa3ea568eee91b68fea34ca6b2f3fc41f7e672394eddcbb390e611c646b3f1a4349ce3ac541f636f55b4f1ba9222da6d"' :
                                            'id="xs-controllers-links-module-EmailSubscriptionModule-942ac917bbe7f284e95600c81713985baa3ea568eee91b68fea34ca6b2f3fc41f7e672394eddcbb390e611c646b3f1a4349ce3ac541f636f55b4f1ba9222da6d"' }>
                                            <li class="link">
                                                <a href="controllers/EmailSubscriptionController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmailSubscriptionController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EmailSubscriptionModule-942ac917bbe7f284e95600c81713985baa3ea568eee91b68fea34ca6b2f3fc41f7e672394eddcbb390e611c646b3f1a4349ce3ac541f636f55b4f1ba9222da6d"' : 'data-bs-target="#xs-injectables-links-module-EmailSubscriptionModule-942ac917bbe7f284e95600c81713985baa3ea568eee91b68fea34ca6b2f3fc41f7e672394eddcbb390e611c646b3f1a4349ce3ac541f636f55b4f1ba9222da6d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EmailSubscriptionModule-942ac917bbe7f284e95600c81713985baa3ea568eee91b68fea34ca6b2f3fc41f7e672394eddcbb390e611c646b3f1a4349ce3ac541f636f55b4f1ba9222da6d"' :
                                        'id="xs-injectables-links-module-EmailSubscriptionModule-942ac917bbe7f284e95600c81713985baa3ea568eee91b68fea34ca6b2f3fc41f7e672394eddcbb390e611c646b3f1a4349ce3ac541f636f55b4f1ba9222da6d"' }>
                                        <li class="link">
                                            <a href="injectables/EmailSubscriptionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmailSubscriptionService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EventsModule.html" data-type="entity-link" >EventsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-EventsModule-98b1153ad11c4def4b7db8257b957cca8e1ce03fc0c9082e1ad3e704f5859025d40a8f292cce8656703ef0ac9829bc647dd568e35d1f0b34c3d0c614225fdc5f"' : 'data-bs-target="#xs-controllers-links-module-EventsModule-98b1153ad11c4def4b7db8257b957cca8e1ce03fc0c9082e1ad3e704f5859025d40a8f292cce8656703ef0ac9829bc647dd568e35d1f0b34c3d0c614225fdc5f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-EventsModule-98b1153ad11c4def4b7db8257b957cca8e1ce03fc0c9082e1ad3e704f5859025d40a8f292cce8656703ef0ac9829bc647dd568e35d1f0b34c3d0c614225fdc5f"' :
                                            'id="xs-controllers-links-module-EventsModule-98b1153ad11c4def4b7db8257b957cca8e1ce03fc0c9082e1ad3e704f5859025d40a8f292cce8656703ef0ac9829bc647dd568e35d1f0b34c3d0c614225fdc5f"' }>
                                            <li class="link">
                                                <a href="controllers/EventsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EventsModule-98b1153ad11c4def4b7db8257b957cca8e1ce03fc0c9082e1ad3e704f5859025d40a8f292cce8656703ef0ac9829bc647dd568e35d1f0b34c3d0c614225fdc5f"' : 'data-bs-target="#xs-injectables-links-module-EventsModule-98b1153ad11c4def4b7db8257b957cca8e1ce03fc0c9082e1ad3e704f5859025d40a8f292cce8656703ef0ac9829bc647dd568e35d1f0b34c3d0c614225fdc5f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EventsModule-98b1153ad11c4def4b7db8257b957cca8e1ce03fc0c9082e1ad3e704f5859025d40a8f292cce8656703ef0ac9829bc647dd568e35d1f0b34c3d0c614225fdc5f"' :
                                        'id="xs-injectables-links-module-EventsModule-98b1153ad11c4def4b7db8257b957cca8e1ce03fc0c9082e1ad3e704f5859025d40a8f292cce8656703ef0ac9829bc647dd568e35d1f0b34c3d0c614225fdc5f"' }>
                                        <li class="link">
                                            <a href="injectables/EventsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtAuthStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtAuthStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ImagekitModule.html" data-type="entity-link" >ImagekitModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ImagekitModule-155c57840e6c039d9f9d05db1f82faa53ad9c35282ba50d04b525d59d531df58209f9e54f0676c3e4f474f49be7e048317bd57d82f47d87f4cf02416567eec12"' : 'data-bs-target="#xs-controllers-links-module-ImagekitModule-155c57840e6c039d9f9d05db1f82faa53ad9c35282ba50d04b525d59d531df58209f9e54f0676c3e4f474f49be7e048317bd57d82f47d87f4cf02416567eec12"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ImagekitModule-155c57840e6c039d9f9d05db1f82faa53ad9c35282ba50d04b525d59d531df58209f9e54f0676c3e4f474f49be7e048317bd57d82f47d87f4cf02416567eec12"' :
                                            'id="xs-controllers-links-module-ImagekitModule-155c57840e6c039d9f9d05db1f82faa53ad9c35282ba50d04b525d59d531df58209f9e54f0676c3e4f474f49be7e048317bd57d82f47d87f4cf02416567eec12"' }>
                                            <li class="link">
                                                <a href="controllers/ImagekitController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImagekitController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ImagekitModule-155c57840e6c039d9f9d05db1f82faa53ad9c35282ba50d04b525d59d531df58209f9e54f0676c3e4f474f49be7e048317bd57d82f47d87f4cf02416567eec12"' : 'data-bs-target="#xs-injectables-links-module-ImagekitModule-155c57840e6c039d9f9d05db1f82faa53ad9c35282ba50d04b525d59d531df58209f9e54f0676c3e4f474f49be7e048317bd57d82f47d87f4cf02416567eec12"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ImagekitModule-155c57840e6c039d9f9d05db1f82faa53ad9c35282ba50d04b525d59d531df58209f9e54f0676c3e4f474f49be7e048317bd57d82f47d87f4cf02416567eec12"' :
                                        'id="xs-injectables-links-module-ImagekitModule-155c57840e6c039d9f9d05db1f82faa53ad9c35282ba50d04b525d59d531df58209f9e54f0676c3e4f474f49be7e048317bd57d82f47d87f4cf02416567eec12"' }>
                                        <li class="link">
                                            <a href="injectables/ImagekitService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImagekitService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MemberModule.html" data-type="entity-link" >MemberModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-MemberModule-33da497ef07841d2d2e13b3275b58f9045b04b073ffc356eb61ecdf770c9014fe68122a47e38f10a778c8827c31b2e27a8ee7f139ddcb68fc47836b03d976de7"' : 'data-bs-target="#xs-controllers-links-module-MemberModule-33da497ef07841d2d2e13b3275b58f9045b04b073ffc356eb61ecdf770c9014fe68122a47e38f10a778c8827c31b2e27a8ee7f139ddcb68fc47836b03d976de7"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-MemberModule-33da497ef07841d2d2e13b3275b58f9045b04b073ffc356eb61ecdf770c9014fe68122a47e38f10a778c8827c31b2e27a8ee7f139ddcb68fc47836b03d976de7"' :
                                            'id="xs-controllers-links-module-MemberModule-33da497ef07841d2d2e13b3275b58f9045b04b073ffc356eb61ecdf770c9014fe68122a47e38f10a778c8827c31b2e27a8ee7f139ddcb68fc47836b03d976de7"' }>
                                            <li class="link">
                                                <a href="controllers/MemberController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MemberController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MemberModule-33da497ef07841d2d2e13b3275b58f9045b04b073ffc356eb61ecdf770c9014fe68122a47e38f10a778c8827c31b2e27a8ee7f139ddcb68fc47836b03d976de7"' : 'data-bs-target="#xs-injectables-links-module-MemberModule-33da497ef07841d2d2e13b3275b58f9045b04b073ffc356eb61ecdf770c9014fe68122a47e38f10a778c8827c31b2e27a8ee7f139ddcb68fc47836b03d976de7"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MemberModule-33da497ef07841d2d2e13b3275b58f9045b04b073ffc356eb61ecdf770c9014fe68122a47e38f10a778c8827c31b2e27a8ee7f139ddcb68fc47836b03d976de7"' :
                                        'id="xs-injectables-links-module-MemberModule-33da497ef07841d2d2e13b3275b58f9045b04b073ffc356eb61ecdf770c9014fe68122a47e38f10a778c8827c31b2e27a8ee7f139ddcb68fc47836b03d976de7"' }>
                                        <li class="link">
                                            <a href="injectables/MemberService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MemberService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/NewsModule.html" data-type="entity-link" >NewsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-NewsModule-28da5fc08137bbb4bb512d5de60c318cf1d14beae8c16d354d2ec2c363b58b47adf0faa4e180ad1859ad9c3f6951a82ddea212edbbaa2cd54f568e1e5eccd0f4"' : 'data-bs-target="#xs-controllers-links-module-NewsModule-28da5fc08137bbb4bb512d5de60c318cf1d14beae8c16d354d2ec2c363b58b47adf0faa4e180ad1859ad9c3f6951a82ddea212edbbaa2cd54f568e1e5eccd0f4"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-NewsModule-28da5fc08137bbb4bb512d5de60c318cf1d14beae8c16d354d2ec2c363b58b47adf0faa4e180ad1859ad9c3f6951a82ddea212edbbaa2cd54f568e1e5eccd0f4"' :
                                            'id="xs-controllers-links-module-NewsModule-28da5fc08137bbb4bb512d5de60c318cf1d14beae8c16d354d2ec2c363b58b47adf0faa4e180ad1859ad9c3f6951a82ddea212edbbaa2cd54f568e1e5eccd0f4"' }>
                                            <li class="link">
                                                <a href="controllers/NewsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NewsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-NewsModule-28da5fc08137bbb4bb512d5de60c318cf1d14beae8c16d354d2ec2c363b58b47adf0faa4e180ad1859ad9c3f6951a82ddea212edbbaa2cd54f568e1e5eccd0f4"' : 'data-bs-target="#xs-injectables-links-module-NewsModule-28da5fc08137bbb4bb512d5de60c318cf1d14beae8c16d354d2ec2c363b58b47adf0faa4e180ad1859ad9c3f6951a82ddea212edbbaa2cd54f568e1e5eccd0f4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-NewsModule-28da5fc08137bbb4bb512d5de60c318cf1d14beae8c16d354d2ec2c363b58b47adf0faa4e180ad1859ad9c3f6951a82ddea212edbbaa2cd54f568e1e5eccd0f4"' :
                                        'id="xs-injectables-links-module-NewsModule-28da5fc08137bbb4bb512d5de60c318cf1d14beae8c16d354d2ec2c363b58b47adf0faa4e180ad1859ad9c3f6951a82ddea212edbbaa2cd54f568e1e5eccd0f4"' }>
                                        <li class="link">
                                            <a href="injectables/JwtAuthStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtAuthStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/NewsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NewsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/NotificationModule.html" data-type="entity-link" >NotificationModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-NotificationModule-f7ee7cab3791a8a17d634f89fe1fe4e7ddb08bcfe721b53f031b6d6c87a79ca46e0825f43225414c34ee928c38ddd586414e89b8f2e980e557bb77d27f303871"' : 'data-bs-target="#xs-controllers-links-module-NotificationModule-f7ee7cab3791a8a17d634f89fe1fe4e7ddb08bcfe721b53f031b6d6c87a79ca46e0825f43225414c34ee928c38ddd586414e89b8f2e980e557bb77d27f303871"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-NotificationModule-f7ee7cab3791a8a17d634f89fe1fe4e7ddb08bcfe721b53f031b6d6c87a79ca46e0825f43225414c34ee928c38ddd586414e89b8f2e980e557bb77d27f303871"' :
                                            'id="xs-controllers-links-module-NotificationModule-f7ee7cab3791a8a17d634f89fe1fe4e7ddb08bcfe721b53f031b6d6c87a79ca46e0825f43225414c34ee928c38ddd586414e89b8f2e980e557bb77d27f303871"' }>
                                            <li class="link">
                                                <a href="controllers/NotificationController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-NotificationModule-f7ee7cab3791a8a17d634f89fe1fe4e7ddb08bcfe721b53f031b6d6c87a79ca46e0825f43225414c34ee928c38ddd586414e89b8f2e980e557bb77d27f303871"' : 'data-bs-target="#xs-injectables-links-module-NotificationModule-f7ee7cab3791a8a17d634f89fe1fe4e7ddb08bcfe721b53f031b6d6c87a79ca46e0825f43225414c34ee928c38ddd586414e89b8f2e980e557bb77d27f303871"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-NotificationModule-f7ee7cab3791a8a17d634f89fe1fe4e7ddb08bcfe721b53f031b6d6c87a79ca46e0825f43225414c34ee928c38ddd586414e89b8f2e980e557bb77d27f303871"' :
                                        'id="xs-injectables-links-module-NotificationModule-f7ee7cab3791a8a17d634f89fe1fe4e7ddb08bcfe721b53f031b6d6c87a79ca46e0825f43225414c34ee928c38ddd586414e89b8f2e980e557bb77d27f303871"' }>
                                        <li class="link">
                                            <a href="injectables/NotificationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OpportunityModule.html" data-type="entity-link" >OpportunityModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-OpportunityModule-3c456fcf6b8b2de5af6b1bd4ff28e4262fd2fde1db2b84ff9cdd09409c45e31efee32261f84af01b59b00a3f6df63f929df89501a6351682ab69fcfeccb039c5"' : 'data-bs-target="#xs-controllers-links-module-OpportunityModule-3c456fcf6b8b2de5af6b1bd4ff28e4262fd2fde1db2b84ff9cdd09409c45e31efee32261f84af01b59b00a3f6df63f929df89501a6351682ab69fcfeccb039c5"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-OpportunityModule-3c456fcf6b8b2de5af6b1bd4ff28e4262fd2fde1db2b84ff9cdd09409c45e31efee32261f84af01b59b00a3f6df63f929df89501a6351682ab69fcfeccb039c5"' :
                                            'id="xs-controllers-links-module-OpportunityModule-3c456fcf6b8b2de5af6b1bd4ff28e4262fd2fde1db2b84ff9cdd09409c45e31efee32261f84af01b59b00a3f6df63f929df89501a6351682ab69fcfeccb039c5"' }>
                                            <li class="link">
                                                <a href="controllers/OpportunityController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OpportunityController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OpportunityModule-3c456fcf6b8b2de5af6b1bd4ff28e4262fd2fde1db2b84ff9cdd09409c45e31efee32261f84af01b59b00a3f6df63f929df89501a6351682ab69fcfeccb039c5"' : 'data-bs-target="#xs-injectables-links-module-OpportunityModule-3c456fcf6b8b2de5af6b1bd4ff28e4262fd2fde1db2b84ff9cdd09409c45e31efee32261f84af01b59b00a3f6df63f929df89501a6351682ab69fcfeccb039c5"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OpportunityModule-3c456fcf6b8b2de5af6b1bd4ff28e4262fd2fde1db2b84ff9cdd09409c45e31efee32261f84af01b59b00a3f6df63f929df89501a6351682ab69fcfeccb039c5"' :
                                        'id="xs-injectables-links-module-OpportunityModule-3c456fcf6b8b2de5af6b1bd4ff28e4262fd2fde1db2b84ff9cdd09409c45e31efee32261f84af01b59b00a3f6df63f929df89501a6351682ab69fcfeccb039c5"' }>
                                        <li class="link">
                                            <a href="injectables/JwtAuthStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtAuthStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OpportunityService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OpportunityService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OrganizationModule.html" data-type="entity-link" >OrganizationModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-OrganizationModule-c48426e547eb8ae0964ef51f3748cf347bd4c4bb333ba508f891f0f8978d6bb7eedebe2e9e926096158c6dc1342ecb0d51d6e8a38fa4245be339fd4dd985a12c"' : 'data-bs-target="#xs-controllers-links-module-OrganizationModule-c48426e547eb8ae0964ef51f3748cf347bd4c4bb333ba508f891f0f8978d6bb7eedebe2e9e926096158c6dc1342ecb0d51d6e8a38fa4245be339fd4dd985a12c"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-OrganizationModule-c48426e547eb8ae0964ef51f3748cf347bd4c4bb333ba508f891f0f8978d6bb7eedebe2e9e926096158c6dc1342ecb0d51d6e8a38fa4245be339fd4dd985a12c"' :
                                            'id="xs-controllers-links-module-OrganizationModule-c48426e547eb8ae0964ef51f3748cf347bd4c4bb333ba508f891f0f8978d6bb7eedebe2e9e926096158c6dc1342ecb0d51d6e8a38fa4245be339fd4dd985a12c"' }>
                                            <li class="link">
                                                <a href="controllers/OrganizationController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrganizationController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OrganizationModule-c48426e547eb8ae0964ef51f3748cf347bd4c4bb333ba508f891f0f8978d6bb7eedebe2e9e926096158c6dc1342ecb0d51d6e8a38fa4245be339fd4dd985a12c"' : 'data-bs-target="#xs-injectables-links-module-OrganizationModule-c48426e547eb8ae0964ef51f3748cf347bd4c4bb333ba508f891f0f8978d6bb7eedebe2e9e926096158c6dc1342ecb0d51d6e8a38fa4245be339fd4dd985a12c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OrganizationModule-c48426e547eb8ae0964ef51f3748cf347bd4c4bb333ba508f891f0f8978d6bb7eedebe2e9e926096158c6dc1342ecb0d51d6e8a38fa4245be339fd4dd985a12c"' :
                                        'id="xs-injectables-links-module-OrganizationModule-c48426e547eb8ae0964ef51f3748cf347bd4c4bb333ba508f891f0f8978d6bb7eedebe2e9e926096158c6dc1342ecb0d51d6e8a38fa4245be339fd4dd985a12c"' }>
                                        <li class="link">
                                            <a href="injectables/JwtAuthStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtAuthStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OrganizationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrganizationService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ProjectModule.html" data-type="entity-link" >ProjectModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ProjectModule-8e8bfeb0c89f1c3f7afe0df8f8b9672f65d0dc2e26b0c603bd42cf8387dfc1693c59a4988a7ab450cce54edf95436a6eb72d75d7f34fb2f3b0526b7071166e2a"' : 'data-bs-target="#xs-controllers-links-module-ProjectModule-8e8bfeb0c89f1c3f7afe0df8f8b9672f65d0dc2e26b0c603bd42cf8387dfc1693c59a4988a7ab450cce54edf95436a6eb72d75d7f34fb2f3b0526b7071166e2a"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ProjectModule-8e8bfeb0c89f1c3f7afe0df8f8b9672f65d0dc2e26b0c603bd42cf8387dfc1693c59a4988a7ab450cce54edf95436a6eb72d75d7f34fb2f3b0526b7071166e2a"' :
                                            'id="xs-controllers-links-module-ProjectModule-8e8bfeb0c89f1c3f7afe0df8f8b9672f65d0dc2e26b0c603bd42cf8387dfc1693c59a4988a7ab450cce54edf95436a6eb72d75d7f34fb2f3b0526b7071166e2a"' }>
                                            <li class="link">
                                                <a href="controllers/ProjectController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ProjectModule-8e8bfeb0c89f1c3f7afe0df8f8b9672f65d0dc2e26b0c603bd42cf8387dfc1693c59a4988a7ab450cce54edf95436a6eb72d75d7f34fb2f3b0526b7071166e2a"' : 'data-bs-target="#xs-injectables-links-module-ProjectModule-8e8bfeb0c89f1c3f7afe0df8f8b9672f65d0dc2e26b0c603bd42cf8387dfc1693c59a4988a7ab450cce54edf95436a6eb72d75d7f34fb2f3b0526b7071166e2a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProjectModule-8e8bfeb0c89f1c3f7afe0df8f8b9672f65d0dc2e26b0c603bd42cf8387dfc1693c59a4988a7ab450cce54edf95436a6eb72d75d7f34fb2f3b0526b7071166e2a"' :
                                        'id="xs-injectables-links-module-ProjectModule-8e8bfeb0c89f1c3f7afe0df8f8b9672f65d0dc2e26b0c603bd42cf8387dfc1693c59a4988a7ab450cce54edf95436a6eb72d75d7f34fb2f3b0526b7071166e2a"' }>
                                        <li class="link">
                                            <a href="injectables/ProjectService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ResourceModule.html" data-type="entity-link" >ResourceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ResourceModule-a6b4d956e1e1a12ea05a0944b0a80413ab67a932e60ab269abee3797590bdaf2676a57b12176950ee60188ccfa41d29c8d64232ce6998ff6499a2f5b7d8b4063"' : 'data-bs-target="#xs-controllers-links-module-ResourceModule-a6b4d956e1e1a12ea05a0944b0a80413ab67a932e60ab269abee3797590bdaf2676a57b12176950ee60188ccfa41d29c8d64232ce6998ff6499a2f5b7d8b4063"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ResourceModule-a6b4d956e1e1a12ea05a0944b0a80413ab67a932e60ab269abee3797590bdaf2676a57b12176950ee60188ccfa41d29c8d64232ce6998ff6499a2f5b7d8b4063"' :
                                            'id="xs-controllers-links-module-ResourceModule-a6b4d956e1e1a12ea05a0944b0a80413ab67a932e60ab269abee3797590bdaf2676a57b12176950ee60188ccfa41d29c8d64232ce6998ff6499a2f5b7d8b4063"' }>
                                            <li class="link">
                                                <a href="controllers/ResourceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ResourceController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ResourceModule-a6b4d956e1e1a12ea05a0944b0a80413ab67a932e60ab269abee3797590bdaf2676a57b12176950ee60188ccfa41d29c8d64232ce6998ff6499a2f5b7d8b4063"' : 'data-bs-target="#xs-injectables-links-module-ResourceModule-a6b4d956e1e1a12ea05a0944b0a80413ab67a932e60ab269abee3797590bdaf2676a57b12176950ee60188ccfa41d29c8d64232ce6998ff6499a2f5b7d8b4063"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ResourceModule-a6b4d956e1e1a12ea05a0944b0a80413ab67a932e60ab269abee3797590bdaf2676a57b12176950ee60188ccfa41d29c8d64232ce6998ff6499a2f5b7d8b4063"' :
                                        'id="xs-injectables-links-module-ResourceModule-a6b4d956e1e1a12ea05a0944b0a80413ab67a932e60ab269abee3797590bdaf2676a57b12176950ee60188ccfa41d29c8d64232ce6998ff6499a2f5b7d8b4063"' }>
                                        <li class="link">
                                            <a href="injectables/ResourceService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ResourceService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SharedModule.html" data-type="entity-link" >SharedModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SharedModule-bc824e6e0699223c452ba9a43b254ff5b298b0cac4a69198424ef82f62953c28c785ba31bdb88cf1ad0d676babea4c3135af635f38388fcdaa1c1ad94bfd859a"' : 'data-bs-target="#xs-injectables-links-module-SharedModule-bc824e6e0699223c452ba9a43b254ff5b298b0cac4a69198424ef82f62953c28c785ba31bdb88cf1ad0d676babea4c3135af635f38388fcdaa1c1ad94bfd859a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SharedModule-bc824e6e0699223c452ba9a43b254ff5b298b0cac4a69198424ef82f62953c28c785ba31bdb88cf1ad0d676babea4c3135af635f38388fcdaa1c1ad94bfd859a"' :
                                        'id="xs-injectables-links-module-SharedModule-bc824e6e0699223c452ba9a43b254ff5b298b0cac4a69198424ef82f62953c28c785ba31bdb88cf1ad0d676babea4c3135af635f38388fcdaa1c1ad94bfd859a"' }>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TagsModule.html" data-type="entity-link" >TagsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-TagsModule-e77fcc6918d091e3a46aa04f49ba626b2168c8f65c1be0bcaccf2973da3a88ba529e1461d0080ff826432c7ce3c9365f51c1ec688ed538bd4a11839713d20232"' : 'data-bs-target="#xs-controllers-links-module-TagsModule-e77fcc6918d091e3a46aa04f49ba626b2168c8f65c1be0bcaccf2973da3a88ba529e1461d0080ff826432c7ce3c9365f51c1ec688ed538bd4a11839713d20232"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-TagsModule-e77fcc6918d091e3a46aa04f49ba626b2168c8f65c1be0bcaccf2973da3a88ba529e1461d0080ff826432c7ce3c9365f51c1ec688ed538bd4a11839713d20232"' :
                                            'id="xs-controllers-links-module-TagsModule-e77fcc6918d091e3a46aa04f49ba626b2168c8f65c1be0bcaccf2973da3a88ba529e1461d0080ff826432c7ce3c9365f51c1ec688ed538bd4a11839713d20232"' }>
                                            <li class="link">
                                                <a href="controllers/TagController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TagController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TagsModule-e77fcc6918d091e3a46aa04f49ba626b2168c8f65c1be0bcaccf2973da3a88ba529e1461d0080ff826432c7ce3c9365f51c1ec688ed538bd4a11839713d20232"' : 'data-bs-target="#xs-injectables-links-module-TagsModule-e77fcc6918d091e3a46aa04f49ba626b2168c8f65c1be0bcaccf2973da3a88ba529e1461d0080ff826432c7ce3c9365f51c1ec688ed538bd4a11839713d20232"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TagsModule-e77fcc6918d091e3a46aa04f49ba626b2168c8f65c1be0bcaccf2973da3a88ba529e1461d0080ff826432c7ce3c9365f51c1ec688ed538bd4a11839713d20232"' :
                                        'id="xs-injectables-links-module-TagsModule-e77fcc6918d091e3a46aa04f49ba626b2168c8f65c1be0bcaccf2973da3a88ba529e1461d0080ff826432c7ce3c9365f51c1ec688ed538bd4a11839713d20232"' }>
                                        <li class="link">
                                            <a href="injectables/TagsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TagsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UserModule.html" data-type="entity-link" >UserModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UserModule-855a39559d4a980191f9341a3dc685e72568c99cd3035417320ff7453d8e94bbc0e61b76a2d6c35b8909cf7ea3607e760d2bb54d6b9d9f9e4acd82592354bbe1"' : 'data-bs-target="#xs-controllers-links-module-UserModule-855a39559d4a980191f9341a3dc685e72568c99cd3035417320ff7453d8e94bbc0e61b76a2d6c35b8909cf7ea3607e760d2bb54d6b9d9f9e4acd82592354bbe1"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UserModule-855a39559d4a980191f9341a3dc685e72568c99cd3035417320ff7453d8e94bbc0e61b76a2d6c35b8909cf7ea3607e760d2bb54d6b9d9f9e4acd82592354bbe1"' :
                                            'id="xs-controllers-links-module-UserModule-855a39559d4a980191f9341a3dc685e72568c99cd3035417320ff7453d8e94bbc0e61b76a2d6c35b8909cf7ea3607e760d2bb54d6b9d9f9e4acd82592354bbe1"' }>
                                            <li class="link">
                                                <a href="controllers/UserController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UserModule-855a39559d4a980191f9341a3dc685e72568c99cd3035417320ff7453d8e94bbc0e61b76a2d6c35b8909cf7ea3607e760d2bb54d6b9d9f9e4acd82592354bbe1"' : 'data-bs-target="#xs-injectables-links-module-UserModule-855a39559d4a980191f9341a3dc685e72568c99cd3035417320ff7453d8e94bbc0e61b76a2d6c35b8909cf7ea3607e760d2bb54d6b9d9f9e4acd82592354bbe1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UserModule-855a39559d4a980191f9341a3dc685e72568c99cd3035417320ff7453d8e94bbc0e61b76a2d6c35b8909cf7ea3607e760d2bb54d6b9d9f9e4acd82592354bbe1"' :
                                        'id="xs-injectables-links-module-UserModule-855a39559d4a980191f9341a3dc685e72568c99cd3035417320ff7453d8e94bbc0e61b76a2d6c35b8909cf7ea3607e760d2bb54d6b9d9f9e4acd82592354bbe1"' }>
                                        <li class="link">
                                            <a href="injectables/JwtAuthStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtAuthStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserAclService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserAclService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AddMessageDto.html" data-type="entity-link" >AddMessageDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AddressInput.html" data-type="entity-link" >AddressInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/AddressOutputDto.html" data-type="entity-link" >AddressOutputDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AddressResponse.html" data-type="entity-link" >AddressResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/AddTagDto.html" data-type="entity-link" >AddTagDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AdminAnalyticsOutput.html" data-type="entity-link" >AdminAnalyticsOutput</a>
                            </li>
                            <li class="link">
                                <a href="classes/AllExceptionsFilter.html" data-type="entity-link" >AllExceptionsFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthorOutputDto.html" data-type="entity-link" >AuthorOutputDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthTokenApiResponse.html" data-type="entity-link" >AuthTokenApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthTokenOutput.html" data-type="entity-link" >AuthTokenOutput</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseAclService.html" data-type="entity-link" >BaseAclService</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseApiErrorObject.html" data-type="entity-link" >BaseApiErrorObject</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseApiErrorResponse.html" data-type="entity-link" >BaseApiErrorResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseApiException.html" data-type="entity-link" >BaseApiException</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseApiResponse.html" data-type="entity-link" >BaseApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/BlogApiResponse.html" data-type="entity-link" >BlogApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/BlogArrayApiResponse.html" data-type="entity-link" >BlogArrayApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/BlogResponseDto.html" data-type="entity-link" >BlogResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/BlogSearchInput.html" data-type="entity-link" >BlogSearchInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/CategoryResponseDto.html" data-type="entity-link" >CategoryResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CategorySearchInput.html" data-type="entity-link" >CategorySearchInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChampionOrderItem.html" data-type="entity-link" >ChampionOrderItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChangePasswordInput.html" data-type="entity-link" >ChangePasswordInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChatMessageDto.html" data-type="entity-link" >ChatMessageDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChatRequestDto.html" data-type="entity-link" >ChatRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClimateChampionResponseDto.html" data-type="entity-link" >ClimateChampionResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClimateChampionSearchInput.html" data-type="entity-link" >ClimateChampionSearchInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/ContentModerationDto.html" data-type="entity-link" >ContentModerationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateBlogDto.html" data-type="entity-link" >CreateBlogDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCategoryDto.html" data-type="entity-link" >CreateCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateChatSessionDto.html" data-type="entity-link" >CreateChatSessionDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateChunkDto.html" data-type="entity-link" >CreateChunkDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateClimateChampionDto.html" data-type="entity-link" >CreateClimateChampionDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateDocumentDto.html" data-type="entity-link" >CreateDocumentDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateEventDto.html" data-type="entity-link" >CreateEventDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateMemberDto.html" data-type="entity-link" >CreateMemberDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateNewsDto.html" data-type="entity-link" >CreateNewsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateOpportunityDto.html" data-type="entity-link" >CreateOpportunityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateOrganizationDto.html" data-type="entity-link" >CreateOrganizationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateProjectDto.html" data-type="entity-link" >CreateProjectDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateResourceDto.html" data-type="entity-link" >CreateResourceDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserInput.html" data-type="entity-link" >CreateUserInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmailService.html" data-type="entity-link" >EmailService</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmailSubscriptionDto.html" data-type="entity-link" >EmailSubscriptionDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/EventApiResponse.html" data-type="entity-link" >EventApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/EventArrayApiResponse.html" data-type="entity-link" >EventArrayApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/EventResponseDto.html" data-type="entity-link" >EventResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/EventsSearchInput.html" data-type="entity-link" >EventsSearchInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/GalleryInput.html" data-type="entity-link" >GalleryInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/GalleryResponse.html" data-type="entity-link" >GalleryResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetChunksDto.html" data-type="entity-link" >GetChunksDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ImagekitApiResponse.html" data-type="entity-link" >ImagekitApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/ImagekitAuthParams.html" data-type="entity-link" >ImagekitAuthParams</a>
                            </li>
                            <li class="link">
                                <a href="classes/ImagekitResponseDto.html" data-type="entity-link" >ImagekitResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginInput.html" data-type="entity-link" >LoginInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/MemberOrderItem.html" data-type="entity-link" >MemberOrderItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/MemberResponseDto.html" data-type="entity-link" >MemberResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MemberSearchInput.html" data-type="entity-link" >MemberSearchInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/MonthlyUserStatsDto.html" data-type="entity-link" >MonthlyUserStatsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MonthlyUserStatsResponseDto.html" data-type="entity-link" >MonthlyUserStatsResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/NewsResponseDto.html" data-type="entity-link" >NewsResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/NewsSearchInput.html" data-type="entity-link" >NewsSearchInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotificationOutputDto.html" data-type="entity-link" >NotificationOutputDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/OpportunityApiResponse.html" data-type="entity-link" >OpportunityApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/OpportunityArrayApiResponse.html" data-type="entity-link" >OpportunityArrayApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/OpportunityResponseDto.html" data-type="entity-link" >OpportunityResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/OpportunitySearchInput.html" data-type="entity-link" >OpportunitySearchInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrganizationApiResponse.html" data-type="entity-link" >OrganizationApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrganizationArrayApiResponse.html" data-type="entity-link" >OrganizationArrayApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrganizationProfileOutputDto.html" data-type="entity-link" >OrganizationProfileOutputDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrganizationResponseDto.html" data-type="entity-link" >OrganizationResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrganizationSearchInput.html" data-type="entity-link" >OrganizationSearchInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaginationParamsDto.html" data-type="entity-link" >PaginationParamsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProjectResponseDto.html" data-type="entity-link" >ProjectResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProjectSearchInput.html" data-type="entity-link" >ProjectSearchInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/PromoteUserInput.html" data-type="entity-link" >PromoteUserInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/RefreshTokenInput.html" data-type="entity-link" >RefreshTokenInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterApiResponse.html" data-type="entity-link" >RegisterApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterInput.html" data-type="entity-link" >RegisterInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterOutput.html" data-type="entity-link" >RegisterOutput</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReorderChampionsDto.html" data-type="entity-link" >ReorderChampionsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReorderMembersDto.html" data-type="entity-link" >ReorderMembersDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RequestContext.html" data-type="entity-link" >RequestContext</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResendVerificationInput.html" data-type="entity-link" >ResendVerificationInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResourceResponseDto.html" data-type="entity-link" >ResourceResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResourceSearchInput.html" data-type="entity-link" >ResourceSearchInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResponseMetadata.html" data-type="entity-link" >ResponseMetadata</a>
                            </li>
                            <li class="link">
                                <a href="classes/TagApiResponse.html" data-type="entity-link" >TagApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/TagArrayApiResponse.html" data-type="entity-link" >TagArrayApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/TagOutputDto.html" data-type="entity-link" >TagOutputDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TagSearchInput.html" data-type="entity-link" >TagSearchInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateBlogDto.html" data-type="entity-link" >UpdateBlogDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateCategoryDto.html" data-type="entity-link" >UpdateCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateClimateChampionDto.html" data-type="entity-link" >UpdateClimateChampionDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateEventDto.html" data-type="entity-link" >UpdateEventDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateMemberDto.html" data-type="entity-link" >UpdateMemberDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateMyOrganizationInput.html" data-type="entity-link" >UpdateMyOrganizationInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateNewsDto.html" data-type="entity-link" >UpdateNewsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateOpportunityDto.html" data-type="entity-link" >UpdateOpportunityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateOrganizationAddressInput.html" data-type="entity-link" >UpdateOrganizationAddressInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateOrganizationDto.html" data-type="entity-link" >UpdateOrganizationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateProjectDto.html" data-type="entity-link" >UpdateProjectDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateResourceDto.html" data-type="entity-link" >UpdateResourceDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateSessionTitleDto.html" data-type="entity-link" >UpdateSessionTitleDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserInput.html" data-type="entity-link" >UpdateUserInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserAccessTokenClaims.html" data-type="entity-link" >UserAccessTokenClaims</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserApiResponse.html" data-type="entity-link" >UserApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserArrayApiResponse.html" data-type="entity-link" >UserArrayApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserOutput.html" data-type="entity-link" >UserOutput</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserRefreshTokenClaims.html" data-type="entity-link" >UserRefreshTokenClaims</a>
                            </li>
                            <li class="link">
                                <a href="classes/VerifyOrganizationInput.html" data-type="entity-link" >VerifyOrganizationInput</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtRefreshGuard.html" data-type="entity-link" >JwtRefreshGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalAuthGuard.html" data-type="entity-link" >LocalAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoggingInterceptor.html" data-type="entity-link" >LoggingInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OptionalJwtAuthGuard.html" data-type="entity-link" >OptionalJwtAuthGuard</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/RolesGuard.html" data-type="entity-link" >RolesGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Actor.html" data-type="entity-link" >Actor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmailConfig.html" data-type="entity-link" >EmailConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmailMetadata.html" data-type="entity-link" >EmailMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TypeMapping.html" data-type="entity-link" >TypeMapping</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});