<?php

function loadSection(array $migration, int $max): array {
	$cfg = [$migration['section']];
	if ($max <= 0) {
		return $cfg;
	}

	$cfg = [$migration['fallback']];
	$max = 3;
	return array_slice($cfg, 0, $max);
}
