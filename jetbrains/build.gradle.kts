import org.jetbrains.intellij.platform.gradle.IntelliJPlatformType

plugins {
    id("org.jetbrains.intellij.platform") version "2.18.1"
}

group = "com.github.andrebrait"
version = providers.environmentVariable("PLUGIN_VERSION").orElse("1.2.0").get()

repositories {
    mavenCentral()
    intellijPlatform {
        defaultRepositories()
    }
}

dependencies {
    intellijPlatform {
        intellijIdea("2023.3.6")
    }
}

intellijPlatform {
    buildSearchableOptions = false
    pluginConfiguration {
        ideaVersion {
            sinceBuild = "233"
        }
    }
    pluginVerification {
        ides {
            current()
            create(IntelliJPlatformType.IntellijIdeaUltimate, "2026.2")
        }
    }
}

tasks.processResources {
    from("invariant.icls") {
        into("colorSchemes")
        rename { "invariant.xml" }
    }
    from("../assets/icon.svg") {
        into("META-INF")
        rename { "pluginIcon.svg" }
    }
}
