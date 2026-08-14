# Licensing and provenance

Scope: the ancestry and licensing evidence for Invariant's editor color definitions. This is a provenance record, not legal advice.

## Conclusion

Invariant's original palette matches the Eclipse Color Theme **Sublime Text 2** definition attributed to **Filip Minev**, not the similarly named **Monokai-Sublime Text 2** page linked during this review.

The matching definition was distributed in the Eclipse Color Theme repository under the Eclipse Public License 1.0. For a simple, internally consistent repository license, the documented path is to use **EPL-2.0** for Invariant and preserve the upstream attribution. EPL-1.0 allows a recipient to choose a later Eclipse Public License published by the Eclipse Foundation. Before this review, the root `LICENSE` said Apache-2.0 while `package.json` said MIT; neither was supported by the discovered upstream provenance.

## Matching source

The matching upstream file is [`sublime-text-2.xml`](https://github.com/eclipse-color-theme/eclipse-color-theme/blob/19b3d30e7d20f358c1a6638829ddddbe1e98cd84/com.github.eclipsecolortheme/src/com/github/eclipsecolortheme/themes/sublime-text-2.xml). Its metadata names Filip Minev as author and dates the definition to January 29, 2011. Its distinctive mappings agree with the scheme first imported into this repository:

| Concept | Matching value |
|---|---:|
| Class and interface | `#52E3F6` |
| Method and method declaration | `#A7EC21` |
| Local variable and field | `#CFBFAD` |
| Parameter | `#79ABFF` |
| Abstract and inherited method | `#BED6FF` |
| Comments | `#FFFFFF` |
| String and number | `#ECE47E`, `#C48CFF` |
| Background | `#272822` |

The definition entered the upstream repository on February 7, 2011 in [commit `19b3d30e`](https://github.com/eclipse-color-theme/eclipse-color-theme/commit/19b3d30e7d20f358c1a6638829ddddbe1e98cd84), whose message says it added themes marked as “Top Pick” on eclipsecolorthemes.org. Its later history only moved the file, reordered its fields, and added the deprecated-member color; the identifying palette remained intact. The [current copy](https://github.com/eclipse-color-theme/eclipse-color-theme/blob/master/com.github.eclipsecolortheme/themes/sublime-text-2.xml) carries legacy theme ID `66`.

## Why the supplied page is probably not the ancestor

The supplied page's [downloaded XML](https://pybhqzklvswplcdvrsqk.supabase.co/storage/v1/object/public/theme-files/e5ee8998-878b-498d-8a0b-fafd84f123a6.xml) attributes **Ag** and differs on several central mappings: classes are `#66D9EF`, methods `#A6E22E`, local variables `#F8F8F2`, fields `#B4B2B3`, and comments `#68715E`.

The current page describes that file as migrated from a legacy system. The maintainer's [migration announcement](https://github.com/eclipse-color-theme/eclipse-color-theme/issues/290) says the replacement site imported themes from the original website, but neither the page nor its XML contains a license notice. It therefore supplies useful historical context, but no clearer license grant and no better palette match.

## License evidence

The upstream repository's [`COPYING`](https://github.com/eclipse-color-theme/eclipse-color-theme/blob/master/COPYING) contains EPL-1.0. It was added in [commit `1fb135c`](https://github.com/eclipse-color-theme/eclipse-color-theme/commit/1fb135c7336e0ece00d7a6748876c3883df3ab00) on January 4, 2011, before the matching theme was added.

The [official EPL-1.0 text](https://www.eclipse.org/legal/epl/epl-v10.html) says that source distributions of the Program must remain under that agreement, include a copy of it, retain existing notices, and identify contributors. Section 7 permits distribution under the received EPL version or a later version published by the Eclipse Foundation. The Eclipse Foundation's [EPL FAQ](https://www.eclipse.org/legal/epl/faq/) gives copying existing EPL source with minor revisions as its clear example of a derivative work and directs recipients redistributing copied EPL source to the EPL's requirements.

The concise repository action is therefore:

1. Use EPL-2.0 consistently in the root license and package metadata.
2. Attribute the source as “Sublime Text 2” by Filip Minev, distributed by Eclipse Color Theme.
3. Describe Monokai as the design ancestry; the [official Monokai history](https://monokai.pro/history) credits the original scheme to Wimer Hazenberg in 2006.

## Remaining uncertainty

- No public copy of the original eclipsecolorthemes.org submission terms was found.
- The available records do not establish the identity of “Ag” or connect that author to this repository's matching palette.
- The records do not independently establish what permission Filip Minev had for the underlying Monokai adaptation.
- Copyright treatment of a palette and the boundary between an adapted definition and independently authored editor mappings are legal questions. The sources above establish the most conservative documented licensing path, not a legal determination.
