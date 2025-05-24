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
                                            'data-bs-target="#controllers-links-module-AppModule-80aeaf866c54af7d5f29fa3cb81d93d320e30e76e60d8808e2b3e6e0626485eccf61714293212b8b74e46a7658cf1535ccecaafd16bc222f492aef36705ceb78"' : 'data-bs-target="#xs-controllers-links-module-AppModule-80aeaf866c54af7d5f29fa3cb81d93d320e30e76e60d8808e2b3e6e0626485eccf61714293212b8b74e46a7658cf1535ccecaafd16bc222f492aef36705ceb78"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-80aeaf866c54af7d5f29fa3cb81d93d320e30e76e60d8808e2b3e6e0626485eccf61714293212b8b74e46a7658cf1535ccecaafd16bc222f492aef36705ceb78"' :
                                            'id="xs-controllers-links-module-AppModule-80aeaf866c54af7d5f29fa3cb81d93d320e30e76e60d8808e2b3e6e0626485eccf61714293212b8b74e46a7658cf1535ccecaafd16bc222f492aef36705ceb78"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-80aeaf866c54af7d5f29fa3cb81d93d320e30e76e60d8808e2b3e6e0626485eccf61714293212b8b74e46a7658cf1535ccecaafd16bc222f492aef36705ceb78"' : 'data-bs-target="#xs-injectables-links-module-AppModule-80aeaf866c54af7d5f29fa3cb81d93d320e30e76e60d8808e2b3e6e0626485eccf61714293212b8b74e46a7658cf1535ccecaafd16bc222f492aef36705ceb78"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-80aeaf866c54af7d5f29fa3cb81d93d320e30e76e60d8808e2b3e6e0626485eccf61714293212b8b74e46a7658cf1535ccecaafd16bc222f492aef36705ceb78"' :
                                        'id="xs-injectables-links-module-AppModule-80aeaf866c54af7d5f29fa3cb81d93d320e30e76e60d8808e2b3e6e0626485eccf61714293212b8b74e46a7658cf1535ccecaafd16bc222f492aef36705ceb78"' }>
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
                                            'data-bs-target="#controllers-links-module-OrganizationModule-1efcc95a23879b5e6b759b0066d0961fd83d6134944e750129812d32471d545b1ec66a5c72ad7f749d4dac844e390a4eb027b20f5c7e8440e3560e5e5166a64c"' : 'data-bs-target="#xs-controllers-links-module-OrganizationModule-1efcc95a23879b5e6b759b0066d0961fd83d6134944e750129812d32471d545b1ec66a5c72ad7f749d4dac844e390a4eb027b20f5c7e8440e3560e5e5166a64c"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-OrganizationModule-1efcc95a23879b5e6b759b0066d0961fd83d6134944e750129812d32471d545b1ec66a5c72ad7f749d4dac844e390a4eb027b20f5c7e8440e3560e5e5166a64c"' :
                                            'id="xs-controllers-links-module-OrganizationModule-1efcc95a23879b5e6b759b0066d0961fd83d6134944e750129812d32471d545b1ec66a5c72ad7f749d4dac844e390a4eb027b20f5c7e8440e3560e5e5166a64c"' }>
                                            <li class="link">
                                                <a href="controllers/OrganizationController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrganizationController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OrganizationModule-1efcc95a23879b5e6b759b0066d0961fd83d6134944e750129812d32471d545b1ec66a5c72ad7f749d4dac844e390a4eb027b20f5c7e8440e3560e5e5166a64c"' : 'data-bs-target="#xs-injectables-links-module-OrganizationModule-1efcc95a23879b5e6b759b0066d0961fd83d6134944e750129812d32471d545b1ec66a5c72ad7f749d4dac844e390a4eb027b20f5c7e8440e3560e5e5166a64c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OrganizationModule-1efcc95a23879b5e6b759b0066d0961fd83d6134944e750129812d32471d545b1ec66a5c72ad7f749d4dac844e390a4eb027b20f5c7e8440e3560e5e5166a64c"' :
                                        'id="xs-injectables-links-module-OrganizationModule-1efcc95a23879b5e6b759b0066d0961fd83d6134944e750129812d32471d545b1ec66a5c72ad7f749d4dac844e390a4eb027b20f5c7e8440e3560e5e5166a64c"' }>
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
                                <a href="classes/AddressInput.html" data-type="entity-link" >AddressInput</a>
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
                                <a href="classes/CreateEventDto.html" data-type="entity-link" >CreateEventDto</a>
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
                                <a href="classes/CreateUserInput.html" data-type="entity-link" >CreateUserInput</a>
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
                                <a href="classes/NewsResponseDto.html" data-type="entity-link" >NewsResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/NewsSearchInput.html" data-type="entity-link" >NewsSearchInput</a>
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
                                <a href="classes/OrganizationResponseDto.html" data-type="entity-link" >OrganizationResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrganizationSearchInput.html" data-type="entity-link" >OrganizationSearchInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaginationParamsDto.html" data-type="entity-link" >PaginationParamsDto</a>
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
                                <a href="classes/RequestContext.html" data-type="entity-link" >RequestContext</a>
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
                                <a href="classes/UpdateEventDto.html" data-type="entity-link" >UpdateEventDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateNewsDto.html" data-type="entity-link" >UpdateNewsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateOpportunityDto.html" data-type="entity-link" >UpdateOpportunityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateOrganizationDto.html" data-type="entity-link" >UpdateOrganizationDto</a>
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