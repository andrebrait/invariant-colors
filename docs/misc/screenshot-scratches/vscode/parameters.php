<?php

function clamp(int $value, int $minimum, int $maximum): int {
	$result = $value;
	if ($result < $minimum) {
		return $minimum;
	}
	if ($result > $maximum) {
		return $maximum;
	}
	return $result;
}
