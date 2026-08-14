plugins {
    id("org.jetbrains.intellij.platform") version "2.18.1"
}

group = "com.github.andrebrait"
version = providers.environmentVariable("PLUGIN_VERSION").orElse("0.1.0").get()

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
